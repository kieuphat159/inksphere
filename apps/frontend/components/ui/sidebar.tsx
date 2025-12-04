"use client";

import { PropsWithChildren, ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "usehooks-ts";

type Props = PropsWithChildren<{
    triggerIcon: ReactNode;
    triggerClassName?: string;
}>;
export default function Sidebar(props: Props) {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
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
                        "w-60 absolute top-0 left-0 z-31 bg-white rounded-r-md min-h-screen transition-transform",
                        show ? "translate-x-0" : "-translate-x-full"
                    )}>
                    {props.children}
                </div>
            )}
        </>
    );
}
