"use server";

import { fetchGraphQL } from "@/lib/fetchGraphQL";
import { GET_POST } from "@/lib/gqlQueries";
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