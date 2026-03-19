"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

function ShareReceiver() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Processing your shared link...");
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        async function processSharedLink() {
            const sharedUrl = searchParams.get("url") || "";
            const sharedText = searchParams.get("text") || "";

            // Try to find a URL in the text if sharedUrl is empty (some apps share links inside text)
            let finalUrl = sharedUrl;
            if (!finalUrl && sharedText) {
                const urlMatch = sharedText.match(/https?:\/\/[^\s]+/);
                if (urlMatch) finalUrl = urlMatch[0];
            }

            if (!finalUrl) {
                setStatus("No valid link found to save.");
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            setStatus("Saving link to your database...");
            try {
                const res = await fetch('/api/link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: finalUrl })
                });

                if (res.ok) {
                    setStatus("Successfully saved!");
                } else {
                    setStatus("Failed to save the link. It might be invalid.");
                }
            } catch (e) {
                setStatus("An error occurred while saving.");
            }

            setTimeout(() => {
                router.push('/');
            }, 1000);
        }

        processSharedLink();
    }, [searchParams, router]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="glass-card max-w-sm w-full p-8 text-center flex flex-col items-center gap-4">
                {status.includes("Success") ? (
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                ) : status.includes("valid") || status.includes("Fail") || status.includes("error") ? (
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xl">!</div>
                ) : (
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                )}
                <h2 className="text-xl font-semibold text-white">{status}</h2>
                <p className="text-slate-400 text-sm">You will be redirected automatically.</p>
            </div>
        </div>
    );
}

export default function SharePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}>
            <ShareReceiver />
        </Suspense>
    );
}
