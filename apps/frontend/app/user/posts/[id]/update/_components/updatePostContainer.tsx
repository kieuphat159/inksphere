"use client"

import { updatePost } from "@/lib/actions/postAction";
import { useActionState } from "react";
import UpsertPostForm from "@/app/user/create-post/_components/upsertPostForm";
import { Post } from "@/lib/types/modelTypes";

type Props = {
    post: Post
}

const UpdatePostContainer = ({ post }: Props) => {
    const [state, action] = useActionState(updatePost, {data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags?.map(tag => tag.name).join(","),
        published: post.published? "on": undefined,
        thumbnail: post.thumbnail
    }});
    return <UpsertPostForm state={state} formAction={action} postId={post.id} />
}

export default UpdatePostContainer;