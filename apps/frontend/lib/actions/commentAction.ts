"use server"

import { authFetchGraphQL, fetchGraphQL } from "../fetchGraphQL";
import { CREATE_COMMENT_MUTATION, GET_POST_COMMENTS } from "../gqlQueries";
import { print } from "graphql";
import { CommentEntity } from "../types/modelTypes";
import { count } from "console";
import { CreateCommentFormState } from "../types/formState";
import { CreateCommentFormSchema } from "../zodSchemas/commentFormSchemas";

export async function getPostComments({ postId, take, skip }: {
    postId: number;
    take?: number;
    skip?: number;
}) {
    const data = await fetchGraphQL(print(GET_POST_COMMENTS), {
        postId,
        take,
        skip
    });

    return {
        comments: data.getPostComments as CommentEntity[],
        count: data.postCommentsCount as number
    }
}

export async function saveComment(
    state: CreateCommentFormState,
    formData: FormData
) : Promise<CreateCommentFormState> {
    const validatedFields = CreateCommentFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }
    const data = await authFetchGraphQL(print(CREATE_COMMENT_MUTATION), {
        input: {
            ...validatedFields.data
        }
    });
    
    if (data) {
        return {
            message: "Comment added successfully",
            ok: true,
            open: false,
        }
    }

    return {
        data: Object.fromEntries(formData.entries()),
        message: "Oops! Something went wrong.",
        ok: false,
        open: true,
    }
}