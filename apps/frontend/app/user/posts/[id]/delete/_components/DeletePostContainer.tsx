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
        <div className="bg-card border border-border rounded-sm p-8 w-full max-w-md flex flex-col items-stretch text-left">
            <h2 className="font-serif text-2xl font-bold mb-4 text-foreground text-center">
                Delete Essay
            </h2>
            <div className="mb-6">
                <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-600 rounded-sm text-[10px] font-mono text-center mb-4 leading-relaxed uppercase tracking-wider">
                    Are you sure you want to delete this essay?<br />
                    <span className="font-bold block mt-1">This action cannot be undone.</span>
                </div>
                <div className="flex flex-col items-center gap-3 bg-muted/15 border border-border/40 p-4 rounded-sm">
                    <div className="relative aspect-video w-36 rounded-sm overflow-hidden border border-border/60">
                        <Image
                            src={post.thumbnail || "/no-image.png"}
                            alt={post.title}
                            fill
                            className="object-cover grayscale"
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-serif font-bold text-foreground text-sm">{post.title}</h3>
                        <p className="text-xs font-serif text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                            {post.content}
                        </p>
                    </div>
                </div>
            </div>
            <form action={action} className="w-full">
                <input type="hidden" name="postId" value={post.id} />
                {state?.message && (
                    <p className="text-red-600 font-mono text-xs mb-4 text-center uppercase tracking-wider">
                        {state.message}
                    </p>
                )}
                <div className="flex gap-3 justify-center w-full">
                    <Link href="/user/posts" className="flex-1">
                        <Button type="button" variant="outline" className="w-full font-mono text-[11px] uppercase tracking-widest py-5 hover:bg-foreground hover:text-background rounded-sm">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={isPending}
                        className="flex-1 font-mono text-[11px] uppercase tracking-widest py-5 bg-red-600 text-white hover:bg-red-700 rounded-sm cursor-pointer"
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DeletePostContainer;
