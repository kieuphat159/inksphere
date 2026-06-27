"use server";

import { authFetchGraphQL } from "../fetchGraphQL";
import {
    ACCEPT_FRIEND_REQUEST_MUTATION,
    CANCEL_FRIEND_REQUEST_MUTATION,
    FRIENDSHIP_STATUS_QUERY,
    GET_FRIENDS,
    GET_INCOMING_FRIEND_REQUESTS,
    GET_OUTGOING_FRIEND_REQUESTS,
    REJECT_FRIEND_REQUEST_MUTATION,
    REMOVE_FRIEND_MUTATION,
    SEARCH_USERS,
    SEND_FRIEND_REQUEST_MUTATION,
} from "../gqlQueries";
import { Friendship, FriendshipRelation, User } from "../types/modelTypes";
import { print } from "graphql";

export async function fetchFriends() {
    const data = await authFetchGraphQL(print(GET_FRIENDS));
    return data.friends as User[];
}

export async function fetchIncomingFriendRequests() {
    const data = await authFetchGraphQL(print(GET_INCOMING_FRIEND_REQUESTS));
    return data.incomingFriendRequests as Friendship[];
}

export async function fetchOutgoingFriendRequests() {
    const data = await authFetchGraphQL(print(GET_OUTGOING_FRIEND_REQUESTS));
    return data.outgoingFriendRequests as Friendship[];
}

export async function searchUsers(query: string, take = 10) {
    const data = await authFetchGraphQL(print(SEARCH_USERS), { query, take });
    return data.searchUsers as User[];
}

export async function getFriendshipStatus(userId: number) {
    const data = await authFetchGraphQL(print(FRIENDSHIP_STATUS_QUERY), { userId });
    return data.friendshipStatus as FriendshipRelation;
}

export async function sendFriendRequest(receiverId: number) {
    await authFetchGraphQL(print(SEND_FRIEND_REQUEST_MUTATION), { receiverId });
}

export async function acceptFriendRequest(friendshipId: number) {
    await authFetchGraphQL(print(ACCEPT_FRIEND_REQUEST_MUTATION), { friendshipId });
}

export async function rejectFriendRequest(friendshipId: number) {
    await authFetchGraphQL(print(REJECT_FRIEND_REQUEST_MUTATION), { friendshipId });
}

export async function cancelFriendRequest(friendshipId: number) {
    await authFetchGraphQL(print(CANCEL_FRIEND_REQUEST_MUTATION), { friendshipId });
}

export async function removeFriend(friendId: number) {
    await authFetchGraphQL(print(REMOVE_FRIEND_MUTATION), { friendId });
}
