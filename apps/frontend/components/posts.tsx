"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types/modelTypes";
import { SessionUser } from "@/lib/session";
import PostCard from "./postCard";
import { fetchPosts } from "@/lib/actions/postAction";
import { Loader2 } from "lucide-react";

type Props = {
    posts: Post[];
    currentPage: number;
    totalPages: number;
    currentUser?: SessionUser;
}

export default function Post(props: Props) {
    const [posts, setPosts] = useState<Post[]>(props.posts);
    const [page, setPage] = useState<number>(props.currentPage);
    const [hasMore, setHasMore] = useState<boolean>(props.currentPage < props.totalPages);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setIsLoading(true);
                    try {
                        const nextPage = page + 1;
                        const { posts: newPosts } = await fetchPosts({ page: nextPage });
                        if (newPosts && newPosts.length > 0) {
                            setPosts((prev) => [...prev, ...newPosts]);
                            setPage(nextPage);
                            setHasMore(nextPage < props.totalPages);
                        } else {
                            setHasMore(false);
                        }
                    } catch (error) {
                        console.error("Error fetching more posts:", error);
                    } finally {
                        setIsLoading(false);
                    }
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTargetRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [page, hasMore, isLoading, props.totalPages]);

    return (
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
            <div className="mb-12 flex flex-col">
                <span className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Freshly Written
                </span>
                <h2 className="font-serif text-3xl font-black tracking-tight text-foreground md:text-4xl">
                    Latest Stories
                </h2>
                <div className="mt-6 h-[1px] w-full bg-border" />
            </div>
            <div className="flex flex-col gap-6">
                {posts.map(post => <PostCard key={post.id} {...post} currentUser={props.currentUser} />)}
            </div>
            
            {hasMore && (
                <div ref={observerTargetRef} className="mt-12 flex justify-center py-4">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                            <span>Loading more stories...</span>
                        </div>
                    )}
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    You have caught up with all stories.
                </div>
            )}
        </section>
    );
}