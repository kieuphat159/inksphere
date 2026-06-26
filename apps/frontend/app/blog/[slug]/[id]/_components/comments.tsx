"use client";

import { getPostComments } from "@/lib/actions/commentAction";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CommentCard from "./commentCard";
import CommentPagination from "./commentPagination";
import CommentCardSkeleton from "@/components/commentCardSkeleton";
import AddComment from "./addComment";
import { SessionUser } from "@/lib/session";

type Props = {
    postId: number;
    user?: SessionUser;
}

const Comments = ({ postId, user }: Props) => {
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["GET_POST_COMMENTS", postId, page],
        queryFn: async () => await getPostComments({ postId, skip: ((page - 1) * DEFAULT_PAGE_SIZE) }),
    })

    const totalPages = Math.ceil((data?.count ?? 0) / DEFAULT_PAGE_SIZE);

    return (
        <div className="border-t border-border pt-10 mt-6 w-full flex flex-col gap-6">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <h6 className="font-serif text-xl font-bold text-foreground">Comments</h6>
                <span className="font-mono text-xs text-muted-foreground">{data?.count ?? 0} Items</span>
            </div>
            { !!user && <AddComment postId={postId} user={user} refetch={refetch} /> }
            <div className="flex flex-col gap-4 my-2">
                { 
                    isLoading
                    ? Array.from({ length: 4 }).map((_, index) => <CommentCardSkeleton  key={index} />)
                    : data?.comments.length === 0 ? (
                        <p className="font-serif text-sm italic text-muted-foreground text-center py-6">No comments yet. Be the first to leave one.</p>
                    ) : (
                        data?.comments.map((comment) => <CommentCard comment={comment} key={comment.id} />)
                    )
                }
            </div>
            {totalPages > 1 && (
                <CommentPagination
                    totalPages={totalPages} 
                    currentPage={page} 
                    setCurrentPage={(p) => setPage(p)} 
                    className="py-4 border-t border-border/40" 
                />
            )}
        </div>
    );
}

export default Comments;