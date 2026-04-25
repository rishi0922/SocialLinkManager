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
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search links or labels..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    No links found. Add your first link above!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    {filteredLinks.map((link, index) => (
                        <LinkCard key={link.id} link={link} index={index} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
