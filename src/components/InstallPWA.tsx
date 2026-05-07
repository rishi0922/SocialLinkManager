"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches;
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isInstalled || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 w-[90%] max-w-sm border border-indigo-400/30">
      <div className="flex flex-col">
        <span className="font-bold">Install LinkManager</span>
        <span className="text-xs text-indigo-200">Required for Share Sheet!</span>
      </div>
      <button 
        onClick={async () => {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            setDeferredPrompt(null);
          }
        }}
        className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-sm active:scale-95 transition-transform"
      >
        <Download className="w-4 h-4" /> Install
      </button>
    </div>
  );
}
