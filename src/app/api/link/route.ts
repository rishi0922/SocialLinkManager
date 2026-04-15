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
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

            return NextResponse.json({
                success: true,
                data: insertedData[0]
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
