import { SessionUser } from "@/lib/session"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowRightStartOnRectangleIcon, ListBulletIcon, PencilSquareIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = {
    user: SessionUser
}

const Profile = ({ user }: Props) => {
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
                    <Link href="/user/create-post" className="flex items-center gap-3 py-2 px-2 hover:bg-foreground hover:text-background transition-colors duration-150">
                        <PencilSquareIcon className="w-4 h-4" />
                        <span>Create Post</span>
                    </Link>
                    <Link href="/user/posts" className="flex items-center gap-3 py-2 px-2 hover:bg-foreground hover:text-background transition-colors duration-150">
                        <ListBulletIcon className="w-4 h-4" />
                        <span>My Posts</span>
                    </Link>
                    <Link href="/user/friends" className="flex items-center gap-3 py-2 px-2 hover:bg-foreground hover:text-background transition-colors duration-150">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Friends</span>
                    </Link>
                    <a href="/api/auth/signout" className="flex items-center gap-3 py-2 px-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-150 border-t border-border mt-1 pt-3">
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                        <span>Sign Out</span>
                    </a>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Profile;