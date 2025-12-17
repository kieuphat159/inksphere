"use server";

import { fetchGraphQL } from "@/lib/fetchGraphQL";
import { GET_POST, GET_POST_BY_ID } from "@/lib/gqlQueries";
import { print } from "graphql";
import { Post } from "../types/modelTypes";
import { transformTakeSkip } from "../helper";

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