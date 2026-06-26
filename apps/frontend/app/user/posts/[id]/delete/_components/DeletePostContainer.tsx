"use client";

import { deletePostAction } from "@/lib/actions/postAction";
import { Button } from "@/components/ui/button";
import { Post } from "@/lib/types/modelTypes";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";

type Props = {
    post: Post;
};

const DeletePostContainer = ({ post }: Props) => {
    const [state, action, isPending] = useActionState(deletePostAction, undefined);

    return (
        <div className="bg-white rounded-md shadow-md p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-700 text-center">
                Delete Post
            </h2>
            <div className="mb-6">
                <p className="text-slate-600 text-center mb-4">
                    Are you sure you want to delete this post?
                    <span className="block text-red-500 font-medium mt-1">
                        This action cannot be undone.
                    </span>
                </p>
                <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-lg">
                    <div className="relative w-32 h-20 rounded-md overflow-hidden">
                        <Image
                            src={post.thumbnail || "/no-image.png"}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-slate-800">{post.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                            {post.content}
                        </p>
                    </div>
                </div>
            </div>
            <form action={action}>
                <input type="hidden" name="postId" value={post.id} />
                {state?.message && (
                    <p className="text-red-500 text-sm mb-4 text-center">
                        {state.message}
                    </p>
                )}
                <div className="flex gap-4 justify-center">
                    <Link href="/user/posts">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DeletePostContainer;
