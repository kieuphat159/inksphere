import { Post } from "@/lib/types/modelTypes"; 
import PostListItem from "./postListItem";
import Pagination from "@/components/pagination";

type Props = {
    posts: Post[];
    currentPage: number;
    totalPages: number;
}

const PostList = async ({ posts, currentPage, totalPages }: Props) => {
    return(
        <div className="w-full flex flex-col gap-4 mt-6">
            <div className="grid grid-cols-8 pb-3 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border gap-4 px-4">
                <div className="col-span-3 text-left">Article</div>
                <div>Date</div>
                <div>Status</div>
                <div>Likes</div>
                <div>Comments</div>
                <div>Actions</div>
            </div>
            <div className="flex flex-col gap-3">
                { posts.map((post) => (
                    <PostListItem key={post.id} post={post} />
                )) }
            </div>
            <Pagination {...{ currentPage, totalPages }} className="my-8" />
        </div>
    );
}

export default PostList;