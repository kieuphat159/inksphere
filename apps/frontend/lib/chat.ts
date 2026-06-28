import { BACKEND_URL } from "./constants";
import { graphqlRequest } from "./graphqlRequest";
import type { Session } from "./session";
import type { User } from "./types/modelTypes";
import { print } from "graphql";
import { GET_FRIENDS } from "./gqlQueries";

export type ChatUser = {
  id: number;
  name: string;
  avatar?: string | null;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  content?: string | null;
  attachmentUrl?: string | null;
  metadata?: Record<string, any> | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: ChatUser;
};

export type ChatConversationMember = {
  conversationId: number;
  userId: number;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  lastReadAt?: string | null;
  mutedUntil?: string | null;
  archivedAt?: string | null;
  user: ChatUser;
};

export type ChatConversation = {
  id: number;
  type: "DIRECT" | "GROUP";
  title?: string | null;
  createdById?: number | null;
  lastMessageId?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: ChatUser | null;
  lastMessage?: ChatMessage | null;
  members: ChatConversationMember[];
};

export type ChatFriend = Pick<User, "id" | "name" | "email" | "avatar" | "bio">;

async function chatRequest<T>(session: Session, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_URL}/chat${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Chat request failed with status ${response.status}`);
  }

  return response.json();
}

export function fetchConversations(session: Session) {
  return chatRequest<ChatConversation[]>(session, "/conversations");
}

export function fetchMessages(
  session: Session,
  conversationId: number,
  options?: { limit?: number; cursor?: number },
) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.cursor) params.set("cursor", String(options.cursor));

  const query = params.toString() ? `?${params.toString()}` : "";
  return chatRequest<ChatMessage[]>(session, `/conversations/${conversationId}/messages${query}`);
}

export function createDirectConversation(session: Session, participantId: number) {
  return chatRequest<ChatConversation>(session, "/conversations/direct", {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
}

export function createGroupConversation(
  session: Session,
  payload: { title?: string; memberIds: number[] },
) {
  return chatRequest<ChatConversation>(session, "/conversations/group", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function markConversationRead(
  session: Session,
  conversationId: number,
  readAt?: string,
) {
  return chatRequest(session, `/conversations/${conversationId}/read`, {
    method: "POST",
    body: JSON.stringify({ readAt }),
  });
}

export function fetchFriends(session: Session) {
  return graphqlRequest<{ friends: ChatFriend[] }>(
    print(GET_FRIENDS),
    {},
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  ).then((data) => data.friends);
}
