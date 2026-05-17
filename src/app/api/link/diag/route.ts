import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

// GET /api/link/diag
// Visit this URL while signed in to verify which database/branch the app is connected to,
// how many links your user has, and how many rows the table holds in total.
// Helpful when "my links disappeared" — if the count drops without you deleting,
// the connected database (DATABASE_URL) has been swapped.
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fingerprint the DATABASE_URL (host + db name only, never the password)
        // so you can confirm at a glance that you're hitting the expected branch.
        const rawUrl = process.env.DATABASE_URL || '';
        let dbHost = 'unknown';
        let dbName = 'unknown';
        let urlHash = 'unknown';
        try {
            const parsed = new URL(rawUrl);
            dbHost = parsed.hostname;
            dbName = parsed.pathname.replace(/^\//, '');
            urlHash = crypto.createHash('sha256').update(rawUrl).digest('hex').slice(0, 12);
        } catch {
            // ignore — keep defaults
        }

        const [{ count: mineCount }] = await sql`
            SELECT COUNT(*)::int AS count FROM links WHERE user_id = ${userId};
        ` as { count: number }[];
        const [{ count: totalCount }] = await sql`
            SELECT COUNT(*)::int AS count FROM links;
        ` as { count: number }[];

        return NextResponse.json({
            success: true,
            userId,
            db: { host: dbHost, name: dbName, urlHash },
            counts: { yours: mineCount, total: totalCount },
            note: "If `db.urlHash` changes between requests, your DATABASE_URL is being swapped on you.",
        });
    } catch (error: any) {
        console.error("Diag error:", error);
        return NextResponse.json({ error: error?.message || 'Diag failed', code: error?.code }, { status: 500 });
    }
}
