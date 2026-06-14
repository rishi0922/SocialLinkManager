import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/link/export
// Returns all links for the signed-in user as a downloadable JSON file.
// Bookmark this URL and visit it weekly — that gives you a manual backup
// that survives any database/auth weirdness.
//
// Usage:
//   - Visit /api/link/export in browser → triggers download as backup-links-YYYY-MM-DD.json
//   - Or fetch it programmatically: const data = await fetch('/api/link/export').then(r => r.json())
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const links = await sql`
            SELECT id, url, title, description, image_url, category, note, created_at
            FROM links
            WHERE user_id = ${userId}
            ORDER BY created_at DESC;
        `;

        const today = new Date().toISOString().split('T')[0];
        const exportPayload = {
            exportedAt: new Date().toISOString(),
            userId,
            count: links.length,
            links,
        };

        return new NextResponse(JSON.stringify(exportPayload, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup-links-${today}.json"`,
            },
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Export error:", err);
        return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
    }
}
