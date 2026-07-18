"use server";

import { fetchGraphQL, authFetchGraphQL } from "../fetchGraphQL";
import { getSession } from "../session";
import { SEARCH_POSTS, SEARCH_USERS } from "../gqlQueries";
import { print } from "graphql";
import { Post, User } from "../types/modelTypes";

export async function searchPostsAndUsers(query: string) {
  if (!query || query.trim() === "") {
    return { posts: [], users: [] };
  }

  const session = await getSession();

  try {
    const postsPromise = fetchGraphQL(print(SEARCH_POSTS), { query, take: 5, skip: 0 })
      .catch(err => {
        console.error("Search posts failed:", err);
        return { searchPosts: [] };
      });

    const usersPromise = session?.accessToken
      ? authFetchGraphQL(print(SEARCH_USERS), { query, take: 5 })
          .catch(err => {
            console.error("Search users failed:", err);
            return { searchUsers: [] };
          })
      : Promise.resolve({ searchUsers: [] });

    const [postsData, usersData] = await Promise.all([postsPromise, usersPromise]);

    return {
      posts: (postsData?.searchPosts ?? []) as Post[],
      users: (usersData?.searchUsers ?? []) as User[],
    };
  } catch (error) {
    console.error("Search failed:", error);
    return { posts: [], users: [] };
  }
}

export async function fetchFullSearch({
  query,
  page = 1,
  pageSize = 10,
}: {
  query: string;
  page?: number;
  pageSize?: number;
}) {
  if (!query || query.trim() === "") {
    return { posts: [], totalPosts: 0, users: [] };
  }

  const skip = (page - 1) * pageSize;
  const session = await getSession();

  try {
    const postsPromise = fetchGraphQL(print(SEARCH_POSTS), { query, skip, take: pageSize })
      .catch(err => {
        console.error("Full search posts failed:", err);
        return { searchPosts: [], searchPostsCount: 0 };
      });

    const usersPromise = session?.accessToken
      ? authFetchGraphQL(print(SEARCH_USERS), { query, take: 10 })
          .catch(err => {
            console.error("Full search users failed:", err);
            return { searchUsers: [] };
          })
      : Promise.resolve({ searchUsers: [] });

    const [postsData, usersData] = await Promise.all([postsPromise, usersPromise]);

    return {
      posts: (postsData?.searchPosts ?? []) as Post[],
      totalPosts: (postsData?.searchPostsCount ?? 0) as number,
      users: (usersData?.searchUsers ?? []) as User[],
    };
  } catch (error) {
    console.error("Full search failed:", error);
    return { posts: [], totalPosts: 0, users: [] };
  }
}
