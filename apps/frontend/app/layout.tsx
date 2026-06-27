import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import './globals.css';
import Link from 'next/link';
import Navbar from "@/components/ui/navbar";
import NavbarContainer from "@/components/ui/navbarContainer";
import Providers from "./providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkSphere | KieuPhat159",
  description: "A blog-first social platform for writers, thinkers, and creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <Providers>
          <NavbarContainer>
            <Navbar />
          </NavbarContainer>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <footer className="border-t border-border mt-auto bg-background text-muted-foreground">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Column 1: Brand */}
              <div className="flex flex-col gap-3">
                <Link href="/" className="font-serif italic text-xl font-bold text-foreground tracking-tight">InkSphere</Link>
                <p className="font-serif text-sm leading-relaxed text-muted-foreground max-w-xs">
                  A blog-first social platform for writers, thinkers, and creators. Write. Connect. Grow.
                </p>
              </div>

              {/* Column 2: Navigation */}
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Navigation</p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">Home</Link>
                <Link href="/about" className="font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">About</Link>
                <Link href="/contact" className="font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">Contact</Link>
                <Link href="/auth/signin" className="font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/auth/signup" className="font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">Sign Up</Link>
              </div>

              {/* Column 3: Socials */}
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Connect</p>
                <a href="mailto:kieuphat159@gmail.com" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75" /></svg>
                  Email
                </a>
                <a href="https://github.com/kieuphat159" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
                <a href="https://www.facebook.com/thanhphat.kieu.942/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                  Facebook
                </a>
                <a href="https://www.linkedin.com/in/ph%C3%A1t-ki%E1%BB%81u-a0205233a/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0"><path d="M20.447 20.452H16.893V14.883c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.977 1.977 0 01-1.972-1.977 1.977 1.977 0 011.972-1.977 1.977 1.977 0 011.972 1.977 1.977 1.977 0 01-1.972 1.977zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border px-6 py-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-mono">
                <span className="uppercase tracking-widest">© {new Date().getFullYear()} InkSphere. All rights reserved.</span>
                <span className="text-muted-foreground/60 uppercase tracking-widest">Built with Next.js · Crafted with care</span>
              </div>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
