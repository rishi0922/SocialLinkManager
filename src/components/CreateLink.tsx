"use client";

import { useState, useRef } from "react";
import { Link as LinkIcon, Loader2, Sparkles, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CreateLink({ onSuccess }: { onSuccess: () => void }) {
    const [url, setUrl] = useState("");
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [quirkyMessage, setQuirkyMessage] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, note })
            });
            const result = await res.json();

            if (res.ok) {
                // Successfully processed
                setQuirkyMessage(result.quirkyMessage || "Saved successfully!");
                setUrl("");
                setNote("");
                onSuccess();

                // Clear message after 5 seconds
                setTimeout(() => setQuirkyMessage(""), 5000);
            } else {
                console.error("Error from API:", result.error);
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Quirky Message Notification */}
            <AnimatePresence>
                {quirkyMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm sm:max-w-md flex justify-center"
                    >
                        <div className="bg-indigo-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] border border-indigo-400 flex items-center gap-3">
                            <PartyPopper className="w-5 h-5 text-indigo-100" />
                            <span className="font-medium text-sm sm:text-base">{quirkyMessage}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="relative group"
            >
                <div className={cn(
                    "absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500",
                    isLoading && "opacity-40 animate-pulse"
                )}></div>
                <div className="relative flex flex-col bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-white/15 hover:border-indigo-500/40 rounded-3xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all w-full min-w-0 group">
                    {/* URL Input Row */}
                    <div className="flex items-center w-full px-1">
                        <div className="pl-4 pr-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200">
                            <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste any URL here..."
                            className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 outline-none text-base sm:text-lg py-3 sm:py-4 w-full min-w-0 transition-colors duration-200"
                            required
                            ref={inputRef}
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading || !url}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 m-1 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline text-sm sm:text-base">Save & Analyze</span>
                                    <span className="sm:hidden">Save</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 my-2 mx-2" />

                    {/* Note Input Row */}
                    <div className="flex items-center w-full px-1">
                        <div className="pl-4 pr-3 text-slate-600 group-focus-within:text-indigo-500 transition-colors duration-200">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a custom note (optional)"
                            className="flex-1 bg-transparent text-slate-400 placeholder-slate-600 outline-none text-sm py-2.5 sm:py-3 w-full min-w-0 transition-colors duration-200"
                        />
                    </div>
                </div>
            </motion.form>


        </div>
    );
}
