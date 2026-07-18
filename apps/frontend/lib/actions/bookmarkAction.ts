"use server";

import { authFetchGraphQL, handleActionError } from "../fetchGraphQL";
import {
  BOOKMARK_POST,
  REMOVE_BOOKMARK,
  IS_BOOKMARKED,
  MY_BOOKMARKS,
} from "../gqlQueries";
import { print } from "graphql";
import { revalidatePath } from "next/cache";

export async function bookmarkPostAction(postId: number) {
  try {
    const data = await authFetchGraphQL(print(BOOKMARK_POST), { postId });
    revalidatePath(`/blog`);
    return !!data?.bookmarkPost;
  } catch (error) {
    return handleActionError(error, "Failed to bookmark post:", false);
  }
}

export async function removeBookmarkAction(postId: number) {
  try {
    const data = await authFetchGraphQL(print(REMOVE_BOOKMARK), { postId });
    revalidatePath(`/blog`);
    revalidatePath("/user/bookmarks");
    return !!data?.removeBookmark;
  } catch (error) {
    return handleActionError(error, "Failed to remove bookmark:", false);
  }
}

export async function fetchIsBookmarked(postId: number) {
  try {
    const data = await authFetchGraphQL(print(IS_BOOKMARKED), { postId });
    return !!data?.isBookmarked;
  } catch (error) {
    return handleActionError(error, "Failed to check is bookmarked:", false);
  }
}

export async function fetchMyBookmarks(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  try {
    const data = await authFetchGraphQL(print(MY_BOOKMARKS), { skip, take: pageSize });
    return {
      bookmarks: data?.myBookmarks ?? [],
      totalBookmarks: data?.myBookmarksCount ?? 0,
    };
  } catch (error) {
    return handleActionError(error, "Failed to fetch my bookmarks:", { bookmarks: [], totalBookmarks: 0 });
  }
}
