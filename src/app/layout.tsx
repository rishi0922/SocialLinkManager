import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Link Manager",
  description: "Save, categorize, and discover your shared links from social media.",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${outfit.variable} antialiased min-h-screen selection:bg-indigo-500/30 flex flex-col`}>
          <header className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
            <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="bg-indigo-500 w-8 h-8 flex items-center justify-center rounded-lg text-white">L</span>
              LinkManager
            </div>
            <div>
              {!userId ? (
                <div className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer">
                  <SignInButton mode="modal" />
                </div>
              ) : (
                <UserButton />
              )}
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }` }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
