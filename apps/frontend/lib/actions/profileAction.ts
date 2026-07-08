"use server";

import { fetchGraphQL } from "@/lib/fetchGraphQL";
import { gql } from "graphql-tag";
import { print } from "graphql";
import { User, Post } from "@/lib/types/modelTypes";
import { transformTakeSkip } from "@/lib/helper";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const GET_USER_BY_USERNAME = gql`
    query getUserByUsername($username: String!) {
        getUserByUsername(username: $username) {
            id
            name
            email
            avatar
            bio
            createdAt
        }
    }
`;

const GET_USER_POSTS_BY_USERNAME = gql`
    query getUserPostsByUsername($username: String!, $skip: Int, $take: Int) {
        getUserPostsByUsername(username: $username, skip: $skip, take: $take) {
            id
            title
            slug
            thumbnail
            content
            createdAt
            author {
                id
                name
                avatar
            }
            _count {
                comments
                likes
            }
        }
    }
`;

const GET_USER_POSTS_COUNT_BY_USERNAME = gql`
    query getUserPostsCountByUsername($username: String!) {
        getUserPostsCountByUsername(username: $username)
    }
`;

export async function fetchUserByUsername(username: string) {
    try {
        const data = await fetchGraphQL(
            print(GET_USER_BY_USERNAME),
            { username }
        );
        return data?.getUserByUsername as User | null;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
    }
}

export async function fetchUserPostsByUsername({
    username,
    page,
    pageSize = DEFAULT_PAGE_SIZE,
}: {
    username: string;
    page?: number;
    pageSize?: number;
}) {
    try {
        const { skip, take } = transformTakeSkip({ page, pageSize });
        const data = await fetchGraphQL(
            print(GET_USER_POSTS_BY_USERNAME),
            { username, skip, take }
        );
        return {
            posts: (data?.getUserPostsByUsername ?? []) as Post[],
            totalPosts: data?.getUserPostsCountByUsername ?? 0,
        };
    } catch (error) {
        console.error("Failed to fetch user posts:", error);
        return {
            posts: [],
            totalPosts: 0,
        };
    }
}
