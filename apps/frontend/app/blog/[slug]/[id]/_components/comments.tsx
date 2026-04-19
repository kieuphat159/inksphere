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
        <div className="p-2 rounded-md shadow-md">
            <h6 className="text-lg text-slate-700">Comments</h6>
            { !!user && <AddComment postId={postId} user={user} refetch={refetch} /> }
            <div className="flex flex-col gap-2">
                { 
                    isLoading
                    ? Array.from({ length: 12 }).map((_, index) => <CommentCardSkeleton  key={index} />)
                    : data?.comments.map((comment) => <CommentCard comment={comment} key={comment.id} />)
                }
            </div>
            <CommentPagination
                totalPages={totalPages} 
                currentPage={page} 
                setCurrentPage={(p) => setPage(p)} 
                className="p-2" 
            />
        </div>
    );
}

export default Comments;