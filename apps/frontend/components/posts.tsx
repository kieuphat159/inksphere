import type { Post } from "@/lib/types/modelTypes";
import PostCard from "./postCard";
import Pagination from "./pagination";

type Props = {
    posts:  Post[];
    currentPage: number;
    totalPages: number;
}

export default function Post(props: Props) {
    return (
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="flex flex-col mb-12">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Freshly Written
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-foreground">
                    Latest Posts
                </h2>
                <div className="w-full h-[1px] bg-border mt-6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                {props.posts.map(post => <PostCard key={post.id} {...post} />)}
            </div>
            <div className="w-full h-[1px] bg-border my-12" />
            <Pagination className='mt-4' currentPage={props.currentPage} totalPages={props.totalPages} />
        </section>
    )
};