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
        <div className="grid grid-cols-8 rounded-md shadow-md m-2 overflow-hidden hover:scale-[101%]
        transition text-center bg-white">
            <div className="relative w-48 h-32">
                <Image src={ post.thumbnail ?? "/no-image.png" } alt={post.title} fill />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
                <p className="line-clamp-2 text-lg px-2 text-slate-700">{post.title}</p>
                <p className="text-sm line-clamp-3 text-slate-500">{post.content}</p>
            </div>
            <p className="flex items-center justify-center">{new Date(post.createdAt).toLocaleDateString()}</p>
            <div className="flex items-center justify-center">
                { post.published && <CheckIcon className="w-5" /> }
            </div>
            <div className="flex items-center justify-center">
                { post._count.likes && <CheckIcon className="w-5" /> }
            </div>
            <div className="flex items-center justify-center">
                { post._count.comments && <CheckIcon className="w-5" /> }
            </div>
            <div className="flex items-center justify-center">
                <PostAction postId={post.id} />
            </div>
        </div>
    );
}

export default PostListItem;