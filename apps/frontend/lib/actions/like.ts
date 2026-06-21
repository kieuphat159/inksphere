"use server"

import { authFetchGraphQL, fetchGraphQL } from "../fetchGraphQL"
import { UNLIKE_POST_MUTATION, POST_LIKE_COUNT_QUERY, USER_LIKED_POST_MUTATION, LIKE_POST_MUTATION } from "../gqlQueries"
import { print } from "graphql"
import { getSession } from "../session"

export async function getPostLikeData(postId: number) {
    const countData = await fetchGraphQL(print(POST_LIKE_COUNT_QUERY), { postId });
    const session = await getSession();

    let userLikedPost = false;

    if (session?.accessToken) {
        try {
            const likedData = await authFetchGraphQL(print(USER_LIKED_POST_MUTATION), { postId });
            userLikedPost = likedData.userLikedPost as boolean;
        } catch (error) {
            userLikedPost = false;
        }
    }

    return {
        likeCount: countData.postLikeCount as number,
        userLikedPost
    }
}

export async function likePost(postId: number) {
    const data = await authFetchGraphQL(print(LIKE_POST_MUTATION), { postId });
}

export async function unlikePost(postId: number) {
    const data = await authFetchGraphQL(print(UNLIKE_POST_MUTATION), { postId });
}