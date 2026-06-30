"use server";

import { authFetchGraphQL, fetchGraphQL } from "@/lib/fetchGraphQL";
import { 
    CREATE_POST_MUTATION, 
    GET_POST, GET_POST_BY_ID, 
    GET_USER_POSTS, 
    UPDATE_POST_MUTATION,
    DELETE_POST_MUTATION
} from "@/lib/gqlQueries";
import { print } from "graphql";
import { Post } from "../types/modelTypes";
import { transformTakeSkip } from "../helper";
import { PostFormState } from "../types/formState";
import { PostFormSchema } from "../zodSchemas/postFormSchema";
import { uploadThumbnail } from "../upload";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const fetchPosts = async ({
    page,
    pageSize
}: {
    page?: number;
    pageSize?: number;
}) => {
    const { skip, take } = transformTakeSkip({ page, pageSize });
    const data = await fetchGraphQL(print(GET_POST), { skip, take });
    // console.log({ data });
    return { posts: data.posts as Post[], totalPosts: data.postsCount };
}

export const fetchPostById = async (id: number) => {
    const data = await fetchGraphQL(print(GET_POST_BY_ID), { id });
    return data.getPostById as Post;
};

export const fetchUserPosts = async ({ page, pageSize }: { page?: number; pageSize?: number }) => {
    const { skip, take } = transformTakeSkip({ page, pageSize });
    const data = await authFetchGraphQL(print(GET_USER_POSTS), { skip, take });
    return { posts: data.getUserPosts as Post[], totalPosts: data.userPostsCount as number };
};

export async function saveNewPost(state: PostFormState, formData: FormData): Promise<PostFormState> {
    const validatedFields = PostFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    )
    if (!validatedFields.success) {
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed",
            ok: false
        }
    }

    
    let thumbnailUrl = "";
    if (validatedFields.data.thumbnail) {
        thumbnailUrl = await uploadThumbnail(validatedFields.data.thumbnail);
    }

    const data = await authFetchGraphQL(print(CREATE_POST_MUTATION), {
        input: {
            ...validatedFields.data,
            thumbnail: thumbnailUrl
        }
    })

    if (data) return {
        message: "Post created successfully",
        ok: true
    }
    return {
        message: "Failed to create post",
        ok: false
    }
}

export async function updatePost(state: PostFormState, formData: FormData): Promise<PostFormState> {
    const validatedFields = PostFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    )
    if (!validatedFields.success) {
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed",
            ok: false
        }
    }

    const postId = formData.get("postId");
    const existingThumbnail = formData.get("existingThumbnail") as string | null;
    const removeThumbnail = formData.get("removeThumbnail") === "on";

    let thumbnailUrl: string | null = null;

    if (validatedFields.data.thumbnail) {
        thumbnailUrl = await uploadThumbnail(validatedFields.data.thumbnail);
    } else if (!removeThumbnail && existingThumbnail) {
        thumbnailUrl = existingThumbnail;
    }

    const { thumbnail, ...inputs } = validatedFields.data;
    const data = await authFetchGraphQL(print(UPDATE_POST_MUTATION), {
        updatePostInput: {
            ...inputs,
            postId: Number(postId),
            thumbnail: thumbnailUrl,
        }
    })

    if (data) return {
        message: "Post updated successfully",
        ok: true,
        data: {
            ...Object.fromEntries(formData.entries()),
            thumbnail: thumbnailUrl,
        }
    }
    return {
        message: "Failed to update post",
        ok: false
    }
} 
export async function deletePost(postId: number) {
    const data = await authFetchGraphQL(print(DELETE_POST_MUTATION), { postId });
    return data.deletePost ? { message: "Post deleted successfully", ok: true } : { message: "Failed to delete post", ok: false };
}

type DeletePostState = {
    message?: string;
    ok?: boolean;
};

export async function deletePostAction(
    _state: DeletePostState | undefined,
    formData: FormData
): Promise<DeletePostState> {
    const postId = Number(formData.get("postId"));
    const data = await authFetchGraphQL(print(DELETE_POST_MUTATION), { postId });
    if (data.deletePost) {
        revalidatePath("/user/posts");
        redirect("/user/posts");
    }
    return { message: "Failed to delete post", ok: false };
}