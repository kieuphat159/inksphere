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

const Like = (props: Props) => {
    const queryClient = useQueryClient();
    const canInteract = !!props.user?.id;

    const { data } = useQuery({
        queryKey: ['GET_POST_LIKES_DATA', props.postId],
        queryFn: async () => await getPostLikeData(props.postId),
    })

    const likeMutation = useMutation({
        mutationFn: () => likePost(props.postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['GET_POST_LIKES_DATA', props.postId] });
        },
    })

    const unlikeMutation = useMutation({
        mutationFn: () => unlikePost(props.postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['GET_POST_LIKES_DATA', props.postId] });
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
