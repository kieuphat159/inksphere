"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

type Props = PropsWithChildren

const DesktopNavbar = (props: Props) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        setScrollPosition(window.scrollY);
    }
    const pathname = usePathname();
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [])

    const isScrolled = scrollPosition > 10;
    const isHomePage = pathname === "/";

    return (
        <nav className={cn("bg-black hidden fixed transition-all duration-300 w-full z-40 top-0 md:block border-b border-transparent text-white", {
            "bg-background/90 backdrop-blur-sm text-foreground border-border": isScrolled || !isHomePage,
        })}>
            <div className="flex items-center px-6 py-4 max-w-7xl mx-auto w-full">
                {props.children}
            </div>
        </nav>
    );
}

export default DesktopNavbar;
