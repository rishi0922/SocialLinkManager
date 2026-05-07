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
                <header className="text-center space-y-4 pt-4 pb-8">
                <div className="inline-block p-1 px-4 rounded-full glass mb-4 border-indigo-500/30 text-indigo-300 text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    Dashboard
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Manage your <span className="gradient-text">digital library</span>
                </h1>
                </header>

                {/* Personalized User Tab */}
                <UserPersonalizedTab refreshKey={refreshKey} />

                {/* Input Form */}
                <section className="max-w-2xl mx-auto">
                <CreateLink onSuccess={handleLinkAdded} />
                </section>

                {/* List & Search */}
                <section className="pt-10 border-t border-white/5">
                <LinkList triggerRefetch={refreshKey} onDelete={handleLinkDeleted} />
                </section>

            </div>
        </div>
      )}
      
    </main>
  );
}
