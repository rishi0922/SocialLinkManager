"use client";

import { SignInButton } from "@clerk/nextjs";
import { Sparkles, BrainCircuit, Layers, Search, ArrowRight, Zap, Globe, Share2, Hexagon } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />,
      title: "AI-Powered Categorization",
      description: "We automatically analyze and tag your links using Gemini, so you never lose track of what you save.",
    },
    {
      icon: <Globe className="w-6 h-6 text-pink-400" />,
      title: "Instant Metadata Fetching",
      description: "Just paste a URL. We handle the heavy lifting of pulling titles, descriptions, and images instantly.",
    },
    {
      icon: <Search className="w-6 h-6 text-emerald-400" />,
      title: "Lightning Fast Search",
      description: "Find that one article you read three weeks ago in milliseconds with our optimized search engine.",
    },
    {
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      title: "Visual Collections",
      description: "Your links are displayed as beautiful, rich cards. A Pinterest-like experience for your entire web history.",
    },
    {
      icon: <Share2 className="w-6 h-6 text-blue-400" />,
      title: "Seamless Sharing",
      description: "Built for the social era. Capture links from any platform and access them anywhere on any device.",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "PWA Ready",
      description: "Install our app directly to your home screen for a native, fast, and frictionless experience.",
    }
  ];

  return (
    <div className="w-full relative min-h-screen pb-20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-pink-500/20 blur-[150px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[10%] left-[30%] w-[30%] h-[30%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow delay-1000" />

      {/* Hero Section */}
      <section className="relative z-10 pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-indigo-500/30 text-indigo-300 text-sm font-medium tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span>The Future of Bookmarking is Here</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up animation-delay-100">
          Your Second Brain for <br className="hidden md:block" />
          <span className="gradient-text">The Internet</span>
        </h1>
        
        <p className="text-slate-400 max-w-2xl mx-auto text-lg sm:text-xl mb-12 animate-fade-in-up animation-delay-200 leading-relaxed">
          Stop losing great content in an ocean of open tabs. Social Link Manager intelligently curates your digital life, turning chaos into a beautifully organized library.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300 w-full sm:w-auto">
          <SignInButton mode="modal">
            <button className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] active:scale-95 overflow-hidden w-full sm:w-auto">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-56 opacity-10"></span>
              <span className="relative flex items-center gap-2">
                Start Curating for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </SignInButton>
        </div>
        
        {/* Mockup / Abstract Visual Representation */}
        <div className="mt-20 w-full max-w-5xl mx-auto relative group animate-fade-in-up animation-delay-400">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card bg-slate-900/80 rounded-2xl border border-white/10 p-2 sm:p-4 overflow-hidden flex items-center justify-center h-64 md:h-96 shadow-2xl">
              {/* Abstract App UI Mockup */}
              <div className="w-full h-full border border-white/5 rounded-xl bg-slate-950/50 flex flex-col p-4 sm:p-6 gap-6 relative overflow-hidden">
                 <div className="w-full flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2 opacity-50">
                        <Hexagon className="w-5 h-5" />
                        <div className="h-4 w-24 bg-white/10 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5" />
                    </div>
                 </div>
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                    {[1,2,3].map((i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col relative group/card">
                            <div className="h-32 bg-white/5 w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="h-4 w-3/4 bg-white/10 rounded" />
                                <div className="h-3 w-full bg-white/5 rounded" />
                                <div className="h-3 w-1/2 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">stay organized</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Powerful features working invisibly in the background so you can focus on reading, watching, and creating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 sm:p-8 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-card p-8 sm:p-12 md:p-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to clear the clutter?</h2>
            <p className="text-slate-300 mb-10 text-lg md:text-xl">Join thousands of users who have revolutionized their web browsing experience.</p>
            <SignInButton mode="modal">
                <button className="px-8 py-4 font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95">
                    Get Started Now
                </button>
            </SignInButton>
          </div>
        </div>
      </section>
    </div>
  );
}
