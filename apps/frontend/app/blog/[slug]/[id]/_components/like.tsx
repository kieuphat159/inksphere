"use client"

import { SessionUser } from "@/lib/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPostLikeData, likePost, unlikePost } from "@/lib/actions/like";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";

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

    return (
        <div className="mt-3 flex items-center justify-start gap-2">
            { data?.userLikedPost ? 
                <button type="button" className="cursor-pointer disabled:cursor-not-allowed" onClick={() => unlikeMutation.mutate()} disabled={!canInteract || unlikeMutation.isPending}>
                    <SolidHeartIcon className="w-6 text-rose-600" />
                </button>
                : <button type="button" className="cursor-pointer disabled:cursor-not-allowed" onClick={() => likeMutation.mutate()} disabled={!canInteract || likeMutation.isPending}>
                    <HeartIcon className="w-6" />
                </button>
            }
            <p className="text-slate-600">{ data?.likeCount ?? 0 }</p>
        </div>
    );
}

export default Like;
