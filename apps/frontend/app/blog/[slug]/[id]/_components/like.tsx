"use client"

import { SessionUser } from "@/lib/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPostLikeData, likePost, unlikePost } from "@/lib/actions/like";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

type Props = {
    postId: number;
    user?: SessionUser;
}

type LikeData = {
    likeCount: number;
    userLikedPost: boolean;
}

const Like = (props: Props) => {
    const queryClient = useQueryClient();
    const canInteract = !!props.user?.id;
    const queryKey = ['GET_POST_LIKES_DATA', props.postId] as const;

    const { data } = useQuery<LikeData>({
        queryKey,
        queryFn: () => getPostLikeData(props.postId),
    })

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
    }

    const likeMutation = useMutation({
        mutationFn: () => likePost(props.postId),
        onMutate: () => {
            updateLikeCache(true);
        },
        onError: () => {
            updateLikeCache(false);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey });
        },
    })

    const unlikeMutation = useMutation({
        mutationFn: () => unlikePost(props.postId),
        onMutate: () => {
            updateLikeCache(false);
        },
        onError: () => {
            updateLikeCache(true);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey });
        },
    })

    const isLiked = !!data?.userLikedPost;

    return (
        <div className="flex items-center justify-start gap-3">
            <button 
                type="button" 
                className={cn(
                    "cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 border border-border px-4 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-all duration-200", 
                    {
                        "bg-foreground text-background border-foreground hover:bg-foreground/90": isLiked,
                        "hover:border-foreground hover:bg-foreground hover:text-background": !isLiked && canInteract,
                        "opacity-50 cursor-not-allowed": !canInteract || likeMutation.isPending || unlikeMutation.isPending
                    }
                )} 
                onClick={() => isLiked ? unlikeMutation.mutate() : likeMutation.mutate()} 
                disabled={!canInteract || likeMutation.isPending || unlikeMutation.isPending}
            >
                {isLiked ? (
                    <SolidHeartIcon className="w-4 h-4 text-red-500 fill-current" />
                ) : (
                    <HeartIcon className="w-4 h-4" />
                )}
                <span>{isLiked ? "Liked" : "Like"}</span>
                <span className="font-bold border-l border-current/20 pl-2 ml-1">{ data?.likeCount ?? 0 }</span>
            </button>
            {!canInteract && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Sign in to like
                </span>
            )}
        </div>
    );
}

export default Like;
