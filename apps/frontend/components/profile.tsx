import { SessionUser } from "@/lib/session"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowRightStartOnRectangleIcon, ListBulletIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = {
    user: SessionUser
}

const Profile = ({ user }: Props) => {
    return (
        <Popover>
            <PopoverTrigger>
                <Avatar>
                    <AvatarImage src={user.avatar} className="border-2 rounded-full" />
                    <AvatarFallback>
                        <UserIcon className="w-8 text-slate-500" />
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className="bg-slate-50 text-slate-900 w-48 p-4 rounded-md shadow-md">
                <div className="flex justify-center items-center gap-3">
                    <UserIcon className="w-4" />
                    <p>{user.name}</p>
                </div>
                <div className="*:grid *:grid-cols-5 *:gap-3 *:items-center *:my-2 *:py-2  [&>*>span]:col-span-4 
                [&>*:hover]:bg-sky-500 [&>*:hover]:text-white *:transition [&>*]:rounded-md [&>*]:px-1 [&>*>*:nth-child(1)]:justify-self-end">
                    <a href="/api/auth/signout">
                        <ArrowRightStartOnRectangleIcon className="w-4" />
                        <span>Sign Out</span>
                    </a>
                    <Link href="/user/create-post">
                        <PencilSquareIcon className="w-4" />
                        <span>Create New Post</span>
                    </Link>
                    <Link href="/user/posts">
                        <ListBulletIcon className="w-4" />
                        <span>Posts</span>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Profile;