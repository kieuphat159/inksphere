"use client";

import { cn } from "@/lib/utils";
import { PropsWithChildren, useEffect, useState } from "react";

type Props = PropsWithChildren

const DesktopNavbar = (props: Props) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        setScrollPosition(window.scrollY);
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [])

    const isScrolled = scrollPosition > 10;

    return (
        <nav className={cn("fixed transition-colors w-full z-31 text-white top-0 block", {
            "bg-white text-gray-700 shadow-md": isScrolled
        })}>
            <div className="flex items-center px-4 py-4 container">
                {props.children}
            </div>
            <hr className="border-b border-gray-100 opacity-25"/>
        </nav>
    );
}

export default DesktopNavbar;
