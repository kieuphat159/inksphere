"use server";

import { fetchGraphQL } from "@/lib/fetchGraphQL";
import { GET_POST } from "@/lib/gqlQueries";
import { print } from "graphql";
import { Post } from "../modelTypes";

export const fetchPosts = async () => {
    const data = await fetchGraphQL(print(GET_POST));
    // console.log({ data });
    return data.posts as Post[];
}