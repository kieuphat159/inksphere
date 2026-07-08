"use client";

import Image from "next/image";
import { Post } from "@/lib/types/modelTypes";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FriendButton from "@/app/user/friends/_components/friendButton";
import { SessionUser } from "@/lib/session";
import { getPostLikeData, likePost, unlikePost } from "@/lib/actions/like";
import { ChatBubbleLeftEllipsisIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Props = Partial<Post> & {
    currentUser?: SessionUser;
    hideFriendButton?: boolean;
};

type LikeData = {
    likeCount: number;
    userLikedPost: boolean;
};

const stripHtml = (value?: string | null) => {
    if (!value) return "";

    return value
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

export default function PostCard({
    id,
    title,
    thumbnail,
    slug,
    content,
    createdAt,
    author,
    currentUser,
    _count,
    hideFriendButton,
}: Props) {
    const queryClient = useQueryClient();
    const canInteract = !!currentUser?.id;
    const queryKey = ["GET_POST_LIKES_DATA", id] as const;
    const plainContent = stripHtml(content ?? "");
    const previewText = plainContent.slice(0, 220);
    const isLong = plainContent.length > 220;
    const detailHref = slug && id ? `/blog/${slug}/${id}` : `/blog/post/${id}`;
    const commentsHref = `${detailHref}#comments`;
    const authorName = author?.name ?? "Author";
    const authorInitials = authorName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const postDate = new Date(createdAt ?? "").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const profileHref = author?.name ? `/user/${encodeURIComponent(author.name)}` : "#";

    const updateLikeCache = (liked: boolean) => {
        queryClient.setQueryData<LikeData>(queryKey, (current) => {
            const baseCount = current?.likeCount ?? 0;
            const alreadyLiked = current?.userLikedPost ?? false;

            if (alreadyLiked === liked) {
                return current ?? { likeCount: baseCount, userLikedPost: liked };
            }

            return {
                likeCount: liked ? baseCount + 1 : Math.max(baseCount - 1, 0),
                userLikedPost: liked,
            };
        });
    };

    const { data } = useQuery<LikeData>({
        queryKey,
        queryFn: () => getPostLikeData(id!),
        enabled: !!id,
        initialData: {
            likeCount: _count?.likes ?? 0,
            userLikedPost: false,
        },
    });

    const likeMutation = useMutation({
        mutationFn: () => {
            if (!id) throw new Error("Missing post id");
            return likePost(id);
        },
        onMutate: () => {
            updateLikeCache(true);
        },
        onError: () => {
            updateLikeCache(false);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey });
        },
    });

    const unlikeMutation = useMutation({
        mutationFn: () => {
            if (!id) throw new Error("Missing post id");
            return unlikePost(id);
        },
        onMutate: () => {
            updateLikeCache(false);
        },
        onError: () => {
            updateLikeCache(true);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey });
        },
    });

    const isLiked = !!data?.userLikedPost;
    const likeCount = data?.likeCount ?? 0;

    return (
        <article className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md">
            <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
                <Image
                    src={thumbnail ?? "/no-image.png"}
                    alt={title ?? ""}
                    fill
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                />
            </div>
            <div className="flex flex-col gap-4 p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                    <Link href={profileHref} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Avatar className="size-10 border border-border/80">
                            <AvatarImage src={author?.avatar ?? undefined} />
                            <AvatarFallback>{authorInitials || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground">{authorName}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {postDate}
                            </p>
                        </div>
                    </Link>
                    {!hideFriendButton && author?.id ? (
                        <FriendButton
                            targetUserId={author.id}
                            currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                            compact
                        />
                    ) : null}
                </div>

                <Link href={detailHref} className="flex flex-col gap-3">
                    <h3 className="font-serif text-xl font-bold leading-snug tracking-tight text-foreground break-words decoration-1 underline-offset-4 group-hover:underline">
                        {title}
                    </h3>
                    <p className="font-serif text-sm leading-relaxed text-muted-foreground break-words">
                        {previewText}
                        {isLong ? "…" : ""}
                    </p>
                </Link>

                <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                    <button
                        type="button"
                        onClick={() => (isLiked ? unlikeMutation.mutate() : likeMutation.mutate())}
                        disabled={!canInteract || likeMutation.isPending || unlikeMutation.isPending}
                        className={cn(
                            "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50",
                            isLiked && "border-foreground bg-foreground text-background"
                        )}
                    >
                        {isLiked ? (
                            <SolidHeartIcon className="h-4 w-4" />
                        ) : (
                            <HeartIcon className="h-4 w-4" />
                        )}
                        <span>{likeCount} likes</span>
                    </button>
                    <Link
                        href={commentsHref}
                        className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                        <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                        <span>{_count?.comments ?? 0} comments</span>
                    </Link>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <Link
                        href={detailHref}
                        className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground underline-offset-4 hover:underline"
                    >
                        Read more →
                    </Link>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {author?.name ? "Connect" : "Read"}
                    </span>
                </div>
            </div>
        </article>
    );
}
