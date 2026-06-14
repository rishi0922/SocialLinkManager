"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import LinkCard from "./LinkCard";

export interface LinkType {
    id: string;
    url: string;
    title: string;
    description: string;
    category: string;
    image_url: string | null;
    note: string | null;
    created_at: string;
}

export default function LinkList({ triggerRefetch, onDelete }: { triggerRefetch: number, onDelete?: () => void }) {
    const [search, setSearch] = useState("");
    const [links, setLinks] = useState<LinkType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLinks() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/link');
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setLinks(json.data);
                } else {
                    console.error("Error in response:", json.error);
                }
            } catch (error) {
                console.error("Error fetching links:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLinks();
    }, [triggerRefetch]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/link?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLinks(links => links.filter(l => l.id !== id));
                if (onDelete) onDelete();
            } else {
                console.error("Failed to delete link");
            }
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    };

    const filteredLinks = links.filter(
        (link) =>
            link.title?.toLowerCase().includes(search.toLowerCase()) ||
            link.category?.toLowerCase().includes(search.toLowerCase()) ||
            link.description?.toLowerCase().includes(search.toLowerCase()) ||
            link.note?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto w-full px-4 sm:px-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search links or labels..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 text-slate-100 placeholder-slate-500"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                    <p className="text-slate-400 text-sm">Loading your collection...</p>
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="text-center py-24 space-y-4 px-4">
                    <p className="text-2xl font-semibold text-slate-300">No links found</p>
                    <p className="text-slate-400 max-w-md mx-auto">
                        {search ? "Try adjusting your search terms" : "Add your first link to get started!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
                    {filteredLinks.map((link, index) => (
                        <LinkCard key={link.id} link={link} index={index} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
