"use client";

import { Post } from "@/lib/types/modelTypes";
import { User } from "@/lib/types/modelTypes";
import { SessionUser } from "@/lib/session";
import PostCard from "@/components/postCard";
import Pagination from "@/components/pagination";
import Link from "next/link";

type Props = {
  posts: Post[];
  user: User;
  currentPage: number;
  totalPages: number;
  currentUser?: SessionUser;
  isOwnProfile: boolean;
};

const ProfilePosts = ({
  posts,
  user,
  currentPage,
  totalPages,
  currentUser,
  isOwnProfile,
}: Props) => {
  const noPosts = posts.length === 0;

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h2 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            {isOwnProfile ? "My Posts" : `Posts by ${user.name}`}
          </h2>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {noPosts
              ? isOwnProfile
                ? "You haven't published any posts yet"
                : `${user.name} hasn't published any posts yet`
              : `${totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}`}
          </p>
        </div>

        {noPosts ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-border bg-muted">
              <svg
                className="size-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2">No posts yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {isOwnProfile
                ? "Start sharing your thoughts and stories with the community."
                : `${user.name} is just getting started. Check back later!`}
            </p>
            {isOwnProfile && (
              <Link
                href="/user/create-post"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
              >
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  currentUser={currentUser}
                  hideFriendButton
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProfilePosts;
