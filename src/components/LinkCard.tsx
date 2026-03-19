"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Tag, MoreVertical, Trash2 } from "lucide-react";

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card flex flex-col overflow-hidden group hover:-translate-y-1 block relative"
        >
            {/* Absolute positioning for 3-dot menu */}
            <div className="absolute top-3 right-3 z-20">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className="p-1.5 rounded-full bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md"
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
                <div className="h-40 w-full overflow-hidden bg-white/5 border-b border-white/5">
                    <img
                        src={link.image_url}
                        alt={link.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" fill="none"><rect width="100%" height="100%" fill="%231e1b4b"/></svg>';
                        }}
                    />
                </div>
            ) : (
                <div className="h-40 w-full bg-indigo-900/20" />
            )}

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {link.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 flex-1 mb-4">
                    {link.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-auto">
                    {(link.category || "Misc").split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.a>
    );
}
