"use server"

import { fetchGraphQL } from "../fetchGraphQL";
import { GET_POST_COMMENTS } from "../gqlQueries";
import { print } from "graphql";
import { CommentEntity } from "../types/modelTypes";
import { count } from "console";

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