"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const Hero = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.8 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-[#121212] dark:bg-[#0a0a0a] text-white pt-28 pb-16 md:pt-36 md:pb-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                {/* Left Column (Editorial Text) */}
                <div className="md:col-span-7 flex flex-col justify-center text-left">
                    <span className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4 block">
                        EST. 2026 // INSIGHTS & STORIES
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tight mb-6">
                        Welcome to<br />
                        <span className="italic font-normal font-serif text-slate-300">InkSphere</span>
                    </h2>
                    <div className="h-[1px] w-20 bg-slate-500 my-4" />
                    <p className="text-slate-300 text-lg md:text-xl font-serif max-w-xl leading-relaxed mt-2">
                        A blog-first social platform where writers share ideas, connect with readers, and build community.
                    </p>
                </div>

                {/* Right Column (Minimal Frame Image) */}
                <div className="md:col-span-5 flex justify-center items-center">
                    <div className="relative border border-slate-700/50 p-3 bg-slate-900/20 group">
                        <Image
                            ref={imgRef as any}
                            src="/hero.png"
                            alt="hero img"
                            width={384}
                            height={384}
                            priority
                            className={cn(
                                "w-full max-w-sm h-auto object-cover contrast-110 transition-all duration-750",
                                isVisible ? "grayscale-0" : "grayscale",
                                "md:grayscale md:group-hover:grayscale-0"
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;