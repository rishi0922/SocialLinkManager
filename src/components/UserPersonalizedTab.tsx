"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, Library, Zap, Database, Cake, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function UserPersonalizedTab() {
    const { user, isLoaded } = useUser();
    const [linkCount, setLinkCount] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            fetch('/api/link')
                .then(res => res.json())
                .then(json => {
                    if (json.success && Array.isArray(json.data)) {
                        setLinkCount(json.data.length);
                    }
                })
                .catch(err => console.error("Error fetching stats:", err));
        }
    }, [user]);

    if (!isLoaded || !user) return null;

    const firstName = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];
    
    // Generate a consistent random avatar based on the user's ID
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    // Birthday Logic
    const today = new Date();
    const userBirthday = (user as any).birthday;
    const isBirthday = userBirthday && 
        new Date(userBirthday).getMonth() === today.getMonth() && 
        new Date(userBirthday).getDate() === today.getDate();

    // Special Birthday Wish for specific users
    const specialUsers = ["singhpoo2456@gmail.com", "rishi.namdeo"];
    const isSpecialUser = user.emailAddresses.some(e => specialUsers.includes(e.emailAddress)) || 
                         (user.username && specialUsers.includes(user.username));
    
    // For testing/demo: if it's one of the special users, we can treat today as their birthday if requested
    // But usually we respect the date. Let's make it respect the date but use the custom message.

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto mb-8"
        >
            <div className="relative group">
                {/* Background Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative glass-card overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl p-6 sm:p-8">
                    {/* Animated background element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full animate-pulse" />
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-slate-900">
                                <Image 
                                    src={randomAvatar} 
                                    alt={firstName}
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                />
                            </div>
                            {isBirthday && (
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -left-2 bg-pink-500 p-1.5 rounded-lg shadow-lg"
                                >
                                    <Cake className="w-3.5 h-3.5 text-white" />
                                </motion.div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-1.5 rounded-lg shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Hey, <span className="gradient-text">{firstName}</span>
                                </h2>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 w-fit mx-auto sm:mx-0">
                                    Pro Curator
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm sm:text-base max-w-md">
                                {isSpecialUser 
                                    ? `Happy birtday pagal aurat 🎉` 
                                    : (isBirthday 
                                        ? `Happy Birthday, ${firstName}! 🎉 Wishing you an incredible day of discovery and curation.`
                                        : "Your digital library is growing. Gemini is analyzing your latest links to find hidden patterns.")
                                }
                            </p>
                        </div>

                        <div className="flex gap-4 sm:flex-col justify-center border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                            {(isBirthday || isSpecialUser) && (
                                <div className="flex flex-col items-center sm:items-start animate-bounce">
                                    <span className="text-[10px] uppercase tracking-widest text-pink-500 font-bold mb-1 flex items-center gap-1.5">
                                        <Cake className="w-3 h-3" /> {isSpecialUser && !isBirthday ? 'Message' : 'Birthday'}
                                    </span>
                                    <span className="text-pink-300 font-medium text-sm">Active!</span>
                                </div>
                            )}
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                    <Database className="w-3 h-3" /> Library
                                </span>
                                <span className="text-indigo-300 font-medium text-sm">
                                    {linkCount !== null ? `${linkCount} Links` : 'Calculating...'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> Profile
                                </span>
                                <span className="text-pink-300 font-medium text-sm">Custom</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
