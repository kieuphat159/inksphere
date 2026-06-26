import { Post } from "@/lib/types/modelTypes";
import { CheckIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import PostAction from "./postAction";

type Props = {
    post: Post;
};

const PostListItem = (props: Props) => {
    const { post } = props;
    return (
        <div className="grid grid-cols-8 items-center border border-border bg-card text-card-foreground p-3 rounded-sm gap-4 hover:border-foreground/30 transition-all duration-200 text-center">
            <div className="relative aspect-[3/2] w-24 md:w-28 border border-border/60 rounded-sm overflow-hidden bg-muted col-span-1">
                <Image src={ post.thumbnail || "/no-image.png" } alt={post.title} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
            <div className="flex flex-col gap-1 col-span-2 text-left justify-center pl-2">
                <p className="line-clamp-1 font-serif text-sm font-bold text-foreground" title={post.title}>{post.title}</p>
                <p className="text-[11px] font-serif line-clamp-2 text-muted-foreground leading-normal">{post.content}</p>
            </div>
            <p className="font-mono text-xs text-muted-foreground flex items-center justify-center">
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex items-center justify-center">
                { post.published ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/20 rounded-sm font-bold">Live</span>
                ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 border border-border rounded-sm font-bold">Draft</span>
                )}
            </div>
            <div className="flex items-center justify-center font-mono text-xs text-foreground font-bold">
                { post._count.likes ? (
                    <span className="flex items-center gap-1">
                        <span className="text-red-500">♥</span> {post._count.likes}
                    </span>
                ) : (
                    <span className="text-muted-foreground/30">-</span>
                ) }
            </div>
            <div className="flex items-center justify-center font-mono text-xs text-foreground font-bold">
                { post._count.comments ? (
                    <span className="flex items-center gap-1">
                        <span>💬</span> {post._count.comments}
                    </span>
                ) : (
                    <span className="text-muted-foreground/30">-</span>
                ) }
            </div>
            <div className="flex items-center justify-center">
                <PostAction postId={post.id} />
            </div>
        </div>
    );
}

export default PostListItem;