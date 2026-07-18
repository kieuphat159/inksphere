import { fetchPostById } from "@/lib/actions/postAction";
import Image from "next/image";
import PostContent from "@/components/editor/PostContent";
import Comments from "./_components/comments";
import { getSession } from "@/lib/session";
import Like from "./_components/like";
import AuthorFriendAction from "./_components/authorFriendAction";
import BookmarkButton from "@/components/ui/bookmarkButton";

type Props = {
    params: {
        id: string;
    }
}

const PostPage = async ({ params }: Props) => {
    const postId = (await params).id;
    const post = await fetchPostById(+postId);
    const session = await getSession();
    return (
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
            <h1 className="font-serif text-3xl md:text-5xl font-black leading-tight tracking-tight text-foreground mb-4">
                {post.title}
            </h1>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 pb-6 border-b border-border flex flex-wrap items-center gap-x-2 gap-y-3">
                <AuthorFriendAction
                    authorId={post.author.id}
                    authorName={post.author.name}
                    currentUser={session?.user}
                />
                <span className="text-border">|</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="relative w-full aspect-[21/10] my-4 border border-border p-2 bg-muted/15">
                <Image
                    src={post.thumbnail ?? "/no-image.png"}
                    alt={post.title} 
                    fill
                    className="object-cover"
                />
            </div>
            <PostContent html={post.content} className="editorial-content mt-8" />
            <div className="w-full h-[1px] bg-border my-10" />
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <Like postId={post.id} user={session?.user} />  
                    <BookmarkButton postId={post.id} user={session?.user} className="h-[38px] px-3.5" />
                </div>
                <Comments postId={post.id} user={session?.user} />
            </div>
        </main>
    )
}

export default PostPage;