import { sql } from './db';

// Audit log helper. Writes one row to link_events for every insert/delete on links.
// This gives a permanent forensic trail so that next time data appears to vanish, we can:
//   1. See exactly when (and by which user_id) every save and delete happened.
//   2. Prove whether the data was deleted via the API or just became invisible because
//      the calling user_id changed.
//
// Audit failures NEVER throw — we don't want a missing log to block a save/delete.
// Worst case, we silently drop the log line and write a console.error.

export type AuditAction = 'insert' | 'delete';

export interface AuditPayload {
    userId: string;
    action: AuditAction;
    linkId?: string | null;
    url?: string | null;
    // Optional source: ip, user agent, referer — useful for spotting weirdness
    requestInfo?: Record<string, string | undefined>;
}

export async function recordAudit(payload: AuditPayload): Promise<void> {
    try {
        await insertAuditRow(payload);
    } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === '42P01') {
            // Table doesn't exist yet — create it then retry.
            try {
                await sql`
                    CREATE TABLE IF NOT EXISTS public.link_events (
                        id BIGSERIAL PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        action TEXT NOT NULL,
                        link_id UUID,
                        url TEXT,
                        request_info JSONB,
                        occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS idx_link_events_user ON public.link_events(user_id);
                    CREATE INDEX IF NOT EXISTS idx_link_events_time ON public.link_events(occurred_at DESC);
                `;
                await insertAuditRow(payload);
            } catch (createErr) {
                console.error("Audit: failed to create link_events table", createErr);
            }
        } else {
            console.error("Audit: failed to record event", err);
        }
    }
}

async function insertAuditRow(payload: AuditPayload): Promise<void> {
    await sql`
        INSERT INTO link_events (user_id, action, link_id, url, request_info)
        VALUES (
            ${payload.userId},
            ${payload.action},
            ${payload.linkId || null},
            ${payload.url || null},
            ${payload.requestInfo ? JSON.stringify(payload.requestInfo) : null}::jsonb
        );
    `;
}
