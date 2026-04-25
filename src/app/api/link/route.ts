import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const links = await sql`SELECT * FROM links WHERE user_id = ${userId} ORDER BY created_at DESC;`;
        return NextResponse.json({ success: true, data: links });
    } catch (error) {
        console.error("Error fetching links:", error);
        return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { url, note } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Fetch Metadata from Microlink
        console.log(`Fetching metadata for: ${url}`);
        let title, description, imageUrl;

        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const ytMatch = url.match(ytRegex);

        try {
            const microlinkRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
            const microlinkData = await microlinkRes.json();

            if (microlinkData.status === 'success') {
                title = microlinkData.data.title;
                description = microlinkData.data.description;
                imageUrl = microlinkData.data.image?.url || null;
            }
        } catch (e) {
            console.error("Microlink fetch error:", e);
            // Ignore error, we will use fallback or fail below
        }

        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            // Override or fallback thumbnail with YouTube's hqdefault
            imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            try {
                const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                if (oembedRes.ok) {
                    const oembedData = await oembedRes.json();
                    if (oembedData.title) title = oembedData.title;
                    if (oembedData.author_name) description = `YouTube Video by ${oembedData.author_name}`;
                }
            } catch (e) {
                console.error("YouTube oEmbed fetch error:", e);
            }
            // Absolute fallback if oembed fails
            if (!title) title = "YouTube Video";
            if (!description) description = "A video from YouTube";
        }

        if (!title && !imageUrl) {
            return NextResponse.json({ error: 'Failed to fetch metadata from URL' }, { status: 400 });
        }

        // 2. Categorize using Gemini + URL heuristics
        const categoryList: string[] = [];

        // Guaranteed domain-based tags
        const urlLower = url.toLowerCase();
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) categoryList.push('YouTube');
        if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) categoryList.push('X');
        if (urlLower.includes('instagram.com')) categoryList.push('Insta');
        if (urlLower.includes('github.com')) categoryList.push('GitHub');
        if (urlLower.includes('linkedin.com')) categoryList.push('LinkedIn');

        try {
            if (process.env.GEMINI_API_KEY) {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `Analyze this link and generate up to 3 highly descriptive, single-word tags (e.g., 'AI', 'Design', 'Tech', 'React', 'News', 'Finance', 'Tutorial').
        
        Link URL: "${url}"
        Link Title: "${title || 'Unknown'}"
        Link Description: "${description || 'No description available'}"
        
        Rules:
        1. Return ONLY the comma-separated words.
        2. Do not include spaces after commas.
        3. Keep tags simple, one-word, and lowercased or properly capitalized.`;

                const result = await model.generateContent(prompt);
                const generatedTags = result.response.text().trim();

                // Parse generated tags, ensuring we just have clean string values
                const parsedTags = generatedTags.replace(/[^a-zA-Z0-9, ]/g, '').split(',')
                    .map(t => t.trim())
                    .filter(t => t.length > 0 && t.toLowerCase() !== 'misc');

                categoryList.push(...parsedTags);
            }
        } catch (error) {
            console.error("Gemini classification failed:", error);
            // Will fallback to just the domain tags or 'Misc'
        }

        // Deduplicate and slice to max 3 tags
        let category = Array.from(new Set(categoryList.map(t => t.charAt(0).toUpperCase() + t.slice(1)))).slice(0, 3).join(', ');

        if (!category) {
            category = "Misc";
        }

        const processedData = {
            url,
            title: title || 'Untitled',
            description: description || '',
            image_url: imageUrl,
            category: category,
            note: note || null,
        };

        // 3. Save to Neon
        try {
            const insertedData = await sql`
                INSERT INTO links (url, title, description, image_url, category, user_id, note)
                VALUES (${processedData.url}, ${processedData.title}, ${processedData.description}, ${processedData.image_url}, ${processedData.category}, ${userId}, ${processedData.note})
                RETURNING *;
            `;

            // 4. Pick quirky message based on URL and category
            const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

            const messages: Record<string, string[]> = {
                youtube:   ["🎬 Lights, camera, saved!", "🍿 Popcorn ready for later?", "📺 Your watch-later list just leveled up.", "🎥 Director's cut, saved!", "▶️ Play it cool, watch it later."],
                twitter:   ["🐦 Tweet captured before it disappears!", "🔥 Hot take saved for reference.", "📌 That spicy tweet is now yours forever.", "🗨️ Words are fleeting, bookmarks are forever.", "🐦 In case they delete it later... 👀"],
                instagram: ["📸 Double tap, now save!", "✨ Your aesthetic just got company.", "🖼️ That vibe is now in your collection.", "📷 Saved before the algorithm buries it.", "💅 Flawless. Pinned to your digital mood board."],
                github:    ["💻 New repo unlocked!", "🛠️ A fellow builder's work, archived.", "⭐ Stars are nice, but your save is better.", "🐙 Octocat approves this bookmark.", "🚀 Code collected. Time to ship something!"],
                linkedin:  ["💼 Networking level: archived.", "📊 Very professional. Very saved.", "🤝 Synergizing your link collection.", "🏢 Career move? Saved for later hustle.", "💡 Big brain LinkedIn energy, stored."],
                reddit:    ["👾 Down the rabbit hole you go!", "🔴 The front page is now your bookmark.", "💬 Found gold in the comments again?", "🤔 This thread deserved to be remembered.", "📜 Internet wisdom, preserved."],
                medium:    ["📖 Your reading list just got smarter.", "✍️ An article worth the 7-minute read.", "💡 Ideas are like links — save them all.", "📰 Brain food, bookmarked.", "🧠 Feeding the mind, one article at a time."],
                news:      ["📰 Hot off the press, saved!", "🗞️ Today's news, tomorrow's reference.", "⚡ Breaking into your bookmark collection.", "📡 Signal acquired, bookmark set.", "🌍 Staying informed, one save at a time."],
                design:    ["🎨 Your design inspo just grew.", "✨ Aesthetic saved. Eyes satisfied.", "🖌️ Moodboard status: thriving.", "💎 A gem for your creative vault.", "🌈 The color palette of good taste."],
                ai:        ["🤖 The robots are watching. Saved!", "🧠 AI-level save detected.", "⚡ Future knowledge, unlocked.", "🔮 One step ahead of the algorithm.", "💡 Your AI reading list just upgraded."],
                coding:    ["👨‍💻 Another bug-free addition to your vault.", "🛠️ Stack Overflow couldn't help? This might!", "⌨️ Code, coffee, and now this link.", "🐛 Not a bug, it's a feature — and it's saved!", "🚀 Ship it to your bookmarks first."],
                misc:      ["📌 Filed away for future genius.", "💼 Tucked into your digital vault.", "🗂️ Your future self will thank you.", "✅ Link secured. Mission complete.", "🔖 Saved and sorted. Impressive taste."],
            };

            const urlL = url.toLowerCase();
            const catL = (processedData.category || '').toLowerCase();

            let quirkyMessage: string;
            if (urlL.includes('youtube') || urlL.includes('youtu.be')) {
                quirkyMessage = pick(messages.youtube);
            } else if (urlL.includes('twitter') || urlL.includes('x.com')) {
                quirkyMessage = pick(messages.twitter);
            } else if (urlL.includes('instagram')) {
                quirkyMessage = pick(messages.instagram);
            } else if (urlL.includes('github')) {
                quirkyMessage = pick(messages.github);
            } else if (urlL.includes('linkedin')) {
                quirkyMessage = pick(messages.linkedin);
            } else if (urlL.includes('reddit')) {
                quirkyMessage = pick(messages.reddit);
            } else if (urlL.includes('medium')) {
                quirkyMessage = pick(messages.medium);
            } else if (catL.includes('news') || catL.includes('article')) {
                quirkyMessage = pick(messages.news);
            } else if (catL.includes('design') || catL.includes('ui') || catL.includes('ux')) {
                quirkyMessage = pick(messages.design);
            } else if (catL.includes('ai') || catL.includes('ml') || catL.includes('llm')) {
                quirkyMessage = pick(messages.ai);
            } else if (catL.includes('react') || catL.includes('code') || catL.includes('dev') || catL.includes('github') || catL.includes('javascript') || catL.includes('python')) {
                quirkyMessage = pick(messages.coding);
            } else {
                quirkyMessage = pick(messages.misc);
            }

            return NextResponse.json({
                success: true,
                data: insertedData[0],
                quirkyMessage: quirkyMessage
            });

        } catch (dbError) {
            console.error("Neon Error:", dbError);
            return NextResponse.json({ error: 'Failed to save to database', details: dbError }, { status: 500 });
        }

    } catch (error) {
        console.error("Error processing link:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
        }

        // Delete but ensure it's scoped to the user
        await sql`DELETE FROM links WHERE id = ${id} AND user_id = ${userId}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting link:", error);
        return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }
}
