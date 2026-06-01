import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

// GET /api/link/audit
// Returns the most recent 200 audit events (inserts + deletes) across ALL users.
// If links "disappeared," compare:
//   - your current userId (from /api/link/diag) against the user_id_hash in the audit log.
//   - Number of 'insert' events vs 'delete' events. If inserts >> deletes, your data still
//     exists somewhere in the table — it's just not under your current user_id.
//
// We hash user_id values in the response so a leaked endpoint doesn't expose Clerk IDs,
// but the hash is stable so you can still cross-reference with the diag endpoint.
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        try {
            const events = await sql`
                SELECT id, user_id, action, link_id, url, occurred_at
                FROM link_events
                ORDER BY occurred_at DESC
                LIMIT 200;
            ` as { id: number; user_id: string; action: string; link_id: string | null; url: string | null; occurred_at: string }[];

            const currentUserHash = crypto.createHash('sha256').update(userId).digest('hex').slice(0, 12);

            const masked = events.map(e => ({
                id: e.id,
                userIdHash: crypto.createHash('sha256').update(e.user_id).digest('hex').slice(0, 12),
                isCurrentUser: crypto.createHash('sha256').update(e.user_id).digest('hex').slice(0, 12) === currentUserHash,
                action: e.action,
                linkId: e.link_id,
                url: e.url,
                occurredAt: e.occurred_at,
            }));

            const insertCount = events.filter(e => e.action === 'insert').length;
            const deleteCount = events.filter(e => e.action === 'delete').length;
            const distinctUsers = new Set(events.map(e => e.user_id)).size;

            return NextResponse.json({
                success: true,
                currentUserHash,
                summary: {
                    totalEvents: events.length,
                    inserts: insertCount,
                    deletes: deleteCount,
                    distinctUsersInTrail: distinctUsers,
                },
                events: masked,
            });
        } catch (error: unknown) {
            const err = error as { code?: string };
            if (err?.code === '42P01') {
                return NextResponse.json({
                    success: true,
                    note: 'No audit events yet — link_events table will be created on the next insert/delete.',
                    events: [],
                });
            }
            throw error;
        }
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Audit fetch error:", err);
        return NextResponse.json({ error: err.message || 'Audit fetch failed' }, { status: 500 });
    }
}
