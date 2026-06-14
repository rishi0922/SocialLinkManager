"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Tag, MoreVertical, Trash2, Sparkles } from "lucide-react";
import { LinkType } from "./LinkList";

export default function LinkCard({ link, index, onDelete }: { link: LinkType; index: number; onDelete?: (id: string) => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) onDelete(link.id);
        setIsMenuOpen(false);
    };

    return (
        <motion.a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ y: -6 }}
            className="glass-card flex flex-col overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(99,102,241,0.2)] block relative transition-all duration-300 cursor-pointer"
        >
            {/* Absolute positioning for 3-dot menu */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className="p-2 sm:p-1.5 rounded-full bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                        >
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-slate-700 transition-colors text-left"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Image Banner */}
            {link.image_url ? (
                <div className="h-32 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-b border-white/10 relative">
                    <img
                        src={link.image_url}
                        alt={link.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" fill="none"><rect width="100%" height="100%" fill="%231e1b4b"/></svg>';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            ) : (
                <div className="h-32 sm:h-44 w-full bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/10 border-b border-white/10 flex items-center justify-center">
                    <div className="text-indigo-400/40 text-3xl sm:text-4xl">✨</div>
                </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0 gap-3">
                <div className="flex justify-between items-start gap-2 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 text-slate-100 group-hover:text-indigo-300 transition-colors duration-200 min-w-0 min-h-[2.4rem] sm:min-h-[2.75rem]">
                        {link.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 mt-1" />
                </div>

                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 min-w-0 break-words leading-relaxed min-h-[2.45rem] sm:min-h-[2.85rem]">
                    {link.description}
                </p>

                {link.note && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 min-w-0 overflow-hidden"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400/80 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-indigo-200/70 leading-snug italic line-clamp-2 min-w-0 break-words">
                            {link.note}
                        </p>
                    </motion.div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-auto pt-1 min-w-0 overflow-hidden">
                    {(link.category || "Misc").split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/10 hover:from-indigo-500/25 hover:to-purple-500/20 text-indigo-300 text-[10px] sm:text-xs font-medium border border-indigo-500/30 transition-all duration-200 max-w-full min-w-0 whitespace-nowrap"
                        >
                            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{tag}</span>
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.a>
    );
}
