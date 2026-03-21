import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import InstallPWA from '@/components/InstallPWA';
import Header from '@/components/Header';
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
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${outfit.variable} antialiased min-h-screen selection:bg-indigo-500/30 flex flex-col`}>
          <InstallPWA />
          <Header />
          <main className="flex-1 pt-24">
            {children}
          </main>
          <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }` }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
