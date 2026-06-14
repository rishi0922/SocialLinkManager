"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import CreateLink from "@/components/CreateLink";
import LinkList from "@/components/LinkList";
import UserPersonalizedTab from "@/components/UserPersonalizedTab";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { isLoaded, isSignedIn } = useAuth();

  const handleLinkAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLinkDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen text-slate-100 relative overflow-hidden">
      
      {/* Landing Page for Logged Out Users */}
      {isLoaded && !isSignedIn && (
        <LandingPage />
      )}

      {/* Dashboard for Logged In Users */}
      {isLoaded && isSignedIn && (
        <div className="p-4 sm:p-8 md:p-16">
            {/* Background ambient light for dashboard */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-pink-500/10 blur-[140px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto space-y-12 relative z-10">

                {/* Dashboard Header Section */}
                <header className="text-center space-y-6 pt-8 pb-12">
                <div className="inline-block p-2 px-5 rounded-full glass mb-6 border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow duration-300">
                    ✨ Dashboard
                </div>
                <div className="space-y-3">
                  <h1 className="text-display">
                    Manage your <span className="gradient-text animate-pulse-slow">digital library</span>
                  </h1>
                  <p className="text-slate-400 text-subheading font-normal max-w-2xl mx-auto leading-relaxed">
                    Save, organize, and discover your favorite links with AI-powered categorization
                  </p>
                </div>
                </header>

                {/* Personalized User Tab */}
                <UserPersonalizedTab refreshKey={refreshKey} />

                {/* Input Form */}
                <section className="max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                <CreateLink onSuccess={handleLinkAdded} />
                </section>

                {/* List & Search */}
                <section className="pt-16 border-t border-white/10 animate-fade-in-up animation-delay-200">
                <LinkList triggerRefetch={refreshKey} onDelete={handleLinkDeleted} />
                </section>

            </div>
        </div>
      )}
      
    </main>
  );
}
