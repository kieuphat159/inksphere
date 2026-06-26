const Hero = () => {
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
                        <span className="italic font-normal font-serif text-slate-300">Inkwell</span>
                    </h2>
                    <div className="h-[1px] w-20 bg-slate-500 my-4" />
                    <p className="text-slate-300 text-lg md:text-xl font-serif max-w-xl leading-relaxed mt-2">
                        A blog-first social platform where writers share ideas, connect with readers, and build community.
                    </p>
                </div>

                {/* Right Column (Minimal Frame Image) */}
                <div className="md:col-span-5 flex justify-center items-center">
                    <div className="relative border border-slate-700/50 p-3 bg-slate-900/20 group">
                        <img 
                            src="/hero.png" 
                            alt="hero img" 
                            className="w-full max-w-sm h-auto object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-750" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;