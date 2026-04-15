"use client";

import { useState, useRef, useEffect } from "react";
import { Link as LinkIcon, Loader2, BookmarkPlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateLink({ onSuccess }: { onSuccess: () => void }) {
    const [url, setUrl] = useState("");
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState("");
    const [currentOrigin, setCurrentOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentOrigin(window.location.origin);
        }
    }, []);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(""); // Clear previous errors
        try {
            const res = await fetch('/api/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, note })
            });
            const result = await res.json();

            if (res.ok) {
                // Successfully processed
                setUrl("");
                setNote("");
                onSuccess();
            } else {
                console.error("Error from API:", result.error);
                setError(result.error);
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to save link');
            alert('Failed to save link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="relative group">
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500",
                    isLoading && "opacity-70 animate-pulse"
                )}></div>
                <div className="relative flex flex-col bg-[#131b2f] border border-white/10 rounded-2xl p-1.5 sm:p-2 shadow-2xl transition-all">
                    <div className="flex items-center w-full">
                        <div className="pl-4 pr-3 text-slate-400">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste any URL here..."
                            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-base sm:text-lg py-3"
                            required
                            ref={inputRef}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 px-4 sm:px-6 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-indigo-200" />
                                    <span className="hidden sm:inline">Save & Analyze</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="w-full h-px bg-white/5 my-1 ml-4 mr-4" />
                    <div className="flex items-center w-full">
                        <div className="pl-4 pr-3 text-slate-500">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a custom note or tag (optional)"
                            className="flex-1 bg-transparent text-slate-400 placeholder-slate-600 outline-none text-sm py-2"
                        />
                    </div>
                </div>
            </form>

            {currentOrigin && (
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-400 text-center md:text-left">
                        <p className="font-semibold text-slate-300">Quick Save via Bookmarklet</p>
                        <p>Drag this button to your bookmarks bar. Click it on any website to save the link instantly!</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(`javascript:(function(){window.location.href='${currentOrigin}/share?url='+encodeURIComponent(window.location.href)+'&text='+encodeURIComponent(document.title);})();`);
                                alert("Bookmarklet copied! Create a new bookmark in your browser and paste this code as the URL.");
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                        >
                            Dragging not working? Click here to copy the code manually.
                        </button>
                    </div>
                    <a
                        href={`javascript:(function(){window.location.href='${currentOrigin}/share?url='+encodeURIComponent(window.location.href)+'&text='+encodeURIComponent(document.title);})();`}
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 w-fit cursor-grab transition-colors"
                        title="Drag to bookmarks bar"
                    >
                        <BookmarkPlus className="w-4 h-4" />
                        Save to LinkManager
                    </a>
                </div>
            )}
        </div>
    );
}
