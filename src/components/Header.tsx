"use client";

import { useState, useEffect } from "react";
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header 
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out border-b",
                scrolled 
                    ? "py-3 bg-slate-950/30 backdrop-blur-sm border-white/5" 
                    : "py-5 bg-slate-950/80 backdrop-blur-xl border-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
                {/* Cool Logo */}
                <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2.5 group cursor-pointer">
                    <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all duration-300">
                        <Hexagon className="w-6 h-6 text-white fill-white/20" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:from-indigo-200 group-hover:to-pink-200 transition-colors duration-300 hidden sm:block">
                        LinkManager
                    </span>
                </div>

                {/* User Info / Auth */}
                <div>
                    {isLoaded && !isSignedIn && (
                        <div className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer active:scale-95">
                            <SignInButton mode="modal" />
                        </div>
                    )}
                    {isLoaded && isSignedIn && (
                        <div className="p-0.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
