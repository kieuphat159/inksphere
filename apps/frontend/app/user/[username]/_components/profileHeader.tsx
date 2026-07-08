"use client";

import { User } from "@/lib/types/modelTypes";
import { SessionUser } from "@/lib/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FriendButton from "@/app/user/friends/_components/friendButton";
import Link from "next/link";

type Props = {
  user: User;
  isOwnProfile: boolean;
  currentUser?: SessionUser;
};

const ProfileHeader = ({ user, isOwnProfile, currentUser }: Props) => {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="border-b border-border/70 bg-background/70">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="size-24 md:size-32 border-2 border-border shrink-0">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-4 mb-3">
              <div className="min-w-0">
                <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight text-foreground break-words">
                  {user.name}
                </h1>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              </div>

              {!isOwnProfile && (
                <div className="mt-1">
                  <FriendButton
                    targetUserId={user.id}
                    currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                  />
                </div>
              )}
            </div>

            {user.bio && (
              <p className="font-serif text-base leading-relaxed text-muted-foreground max-w-2xl mb-4">
                {user.bio}
              </p>
            )}

            {isOwnProfile && (
              <Link
                href="/user/posts"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground underline-offset-4 hover:underline w-fit"
              >
                Edit Profile →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
