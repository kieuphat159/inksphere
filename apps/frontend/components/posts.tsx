import type { Post } from "@/lib/types/modelTypes";
import { SessionUser } from "@/lib/session";
import PostCard from "./postCard";
import Pagination from "./pagination";

type Props = {
    posts: Post[];
    currentPage: number;
    totalPages: number;
    currentUser?: SessionUser;
}

export default function Post(props: Props) {
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
                {props.posts.map(post => <PostCard key={post.id} {...post} currentUser={props.currentUser} />)}
            </div>
            <div className="my-12 h-[1px] w-full bg-border" />
            <Pagination className="mt-4" currentPage={props.currentPage} totalPages={props.totalPages} />
        </section>
    )
};