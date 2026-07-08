"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowRightStartOnRectangleIcon, ListBulletIcon, PencilSquareIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
    user: SessionUser
}

const Spinner = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
    </svg>
);

const Profile = ({ user }: Props) => {
    const [loadingItem, setLoadingItem] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setLoadingItem(null);
    }, [pathname]);

    const handleClick = (href: string) => {
        setLoadingItem(href);
    };

    const profileHref = user.name ? `/user/${encodeURIComponent(user.name)}` : "#";

    const navItems = [
        { href: profileHref, label: "My Profile", Icon: UserIcon },
        { href: "/user/create-post", label: "Create Post", Icon: PencilSquareIcon },
        { href: "/user/posts", label: "My Posts", Icon: ListBulletIcon },
        { href: "/user/friends", label: "Friends", Icon: UserGroupIcon },
    ];

    return (
        <Popover>
            <PopoverTrigger className="cursor-pointer outline-none flex items-center">
                <Avatar className="border border-border">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className="bg-background text-foreground border border-border w-52 p-4 rounded-sm shadow-none z-50 mt-2 flex flex-col gap-3 focus:outline-none">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]" title={user.name}>{user.name}</span>
                </div>
                <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest font-bold">
                    {navItems.map(({ href, label, Icon }) => {
                        const isLoading = loadingItem === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => handleClick(href)}
                                className={cn(
                                    "flex items-center gap-3 py-2 px-2 hover:bg-foreground hover:text-background transition-colors duration-150",
                                    isLoading && "opacity-80 pointer-events-none"
                                )}
                            >
                                {isLoading ? (
                                    <Spinner className="w-4 h-4 animate-spin text-current" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                    <a
                        href="/api/auth/signout"
                        className="flex items-center gap-3 py-2 px-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-150 border-t border-border mt-1 pt-3"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                        <span>Sign Out</span>
                    </a>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Profile;
