"use client";

import FriendButton from "@/app/user/friends/_components/friendButton";
import { SessionUser } from "@/lib/session";
import Link from "next/link";

type Props = {
    authorId: number;
    authorName: string;
    currentUser?: SessionUser;
};

const AuthorFriendAction = ({ authorId, authorName, currentUser }: Props) => {
    return (
        <div className="flex items-center gap-4 flex-wrap">
            <Link href={`/user/${encodeURIComponent(authorName)}`} className="hover:underline underline-offset-4 transition-colors">
                By {authorName}
            </Link>
            <FriendButton
                targetUserId={authorId}
                currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                compact
            />
        </div>
    );
};

export default AuthorFriendAction;
