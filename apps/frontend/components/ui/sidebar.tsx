"use client";

import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "usehooks-ts";
import { usePathname } from "next/navigation";

type Props = PropsWithChildren<{
    triggerIcon: ReactNode;
    triggerClassName?: string;
}>;
export default function Sidebar(props: Props) {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setShow(false);
    }, [pathname]);

    useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setShow(false));
    return (
        <>
            <button onClick={() => setShow((prev) => !prev)} className={props.triggerClassName}>
                {props.triggerIcon}
            </button>
            {show && (
                <div
                    ref={ref}
                    className={cn(
                        "w-64 fixed top-0 left-0 z-50 bg-background border-r border-border min-h-screen transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6 text-foreground",
                        show ? "translate-x-0" : "-translate-x-full"
                    )}>
                    <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="font-serif italic font-bold">Menu</span>
                        <button onClick={() => setShow(false)} className="text-xs font-mono uppercase tracking-widest px-2 py-1 border border-border hover:bg-foreground hover:text-background transition-colors">
                            Close
                        </button>
                    </div>
                    <div className="flex flex-col gap-4 [&>a]:py-2 [&>a]:border-b [&>a]:border-border/40 [&>a]:font-mono [&>a]:uppercase [&>a]:tracking-widest [&>a]:text-xs [&>a]:font-bold [&>a:hover]:text-muted-foreground">
                        {props.children}
                    </div>
                </div>
            )}
        </>
    );
}
