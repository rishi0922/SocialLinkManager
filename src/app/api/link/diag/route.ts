import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

// GET /api/link/diag
// Visit this URL while signed in to verify which database/branch the app is connected to,
// who the app thinks you are, and whether your links live under a different user_id.
//
// This is the single most useful endpoint for diagnosing "my links disappeared":
//   1. If `db.urlHash` changes between visits → your DATABASE_URL is being swapped.
//   2. If `counts.yours` is 0 but `otherUsers` lists a userId with N links →
//      your Clerk identity changed. The data is fine — you're just signed in
//      as a different account than before.
export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();
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

        // List every distinct user_id in the table and how many links each has.
        // If you see your current userId with 0 links AND another userId with N links,
        // that's the smoking gun: your Clerk identity changed (e.g. you signed up with
        // Google originally but signed in with email/password later, creating a new
        // Clerk account). The old data is intact — it's just attached to the old userId.
        const userBreakdown = await sql`
            SELECT user_id, COUNT(*)::int AS count, MAX(created_at) AS last_saved
            FROM links
            WHERE user_id IS NOT NULL
            GROUP BY user_id
            ORDER BY MAX(created_at) DESC
            LIMIT 25;
        ` as { user_id: string; count: number; last_saved: string }[];

        const otherUsers = userBreakdown
            .filter(u => u.user_id !== userId)
            .map(u => ({
                userIdHash: crypto.createHash('sha256').update(u.user_id).digest('hex').slice(0, 12),
                userIdPrefix: u.user_id.slice(0, 10) + '…',
                count: u.count,
                lastSaved: u.last_saved,
            }));

        const sessionInfo = {
            currentUserId: userId,
            currentUserIdHash: crypto.createHash('sha256').update(userId).digest('hex').slice(0, 12),
            // sessionClaims includes things like email, sub, iss — but Clerk auth() may not
            // populate all fields. We surface what's available without leaking secrets.
            email: (sessionClaims as Record<string, unknown> | null)?.email ?? null,
            tokenIssuedAt: (sessionClaims as { iat?: number } | null)?.iat ?? null,
            tokenExpiresAt: (sessionClaims as { exp?: number } | null)?.exp ?? null,
        };

        // Build a clear diagnosis message
        let diagnosis = "Everything looks normal. Your data is attached to your current userId.";
        if (mineCount === 0 && otherUsers.length > 0 && totalCount > 0) {
            diagnosis = "⚠️ SMOKING GUN: You have zero links under your current userId, but other user_ids in this database have links. Your Clerk identity likely changed (e.g. you signed up with Google and later signed in with email, creating a second account). Your old links are intact under the other userId — they aren't deleted. Fix: in Clerk dashboard → Users, find your two accounts, merge them or update the user_id in the links table to your current userId.";
        } else if (totalCount === 0) {
            diagnosis = "⚠️ The links table is completely empty. Either no one has ever saved a link, or you're connected to a different/fresh database. Check `db.urlHash` against a previous diag snapshot to confirm.";
        } else if (mineCount > 0 && otherUsers.length === 0) {
            diagnosis = "✅ Only your userId exists in this DB and you have data. Healthy.";
        }

        return NextResponse.json({
            success: true,
            diagnosis,
            session: sessionInfo,
            db: { host: dbHost, name: dbName, urlHash },
            counts: { yours: mineCount, total: totalCount, distinctUsers: userBreakdown.length },
            otherUsers,
            note: "Save this output once per week. Compare across visits: if `db.urlHash` changes, DATABASE_URL was swapped. If `session.currentUserIdHash` changes, your Clerk identity changed.",
        });
    } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        console.error("Diag error:", err);
        return NextResponse.json({ error: err.message || 'Diag failed', code: err.code }, { status: 500 });
    }
}
