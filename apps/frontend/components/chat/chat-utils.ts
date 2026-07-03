import type { ChatConversation, ChatUser } from "@/lib/chat";

export type SidebarTab = "chats" | "friends";
export type ChatCallState = "idle" | "incoming" | "calling" | "connected";

export function getConversationLabel(conversation: ChatConversation, currentUserId?: string | number) {
  if (conversation.title) return conversation.title;

  const otherMember = conversation.members.find(
    (member) => String(member.userId) !== String(currentUserId),
  );
  if (otherMember?.user?.name) return otherMember.user.name;

  if (conversation.type === "GROUP") {
    return `Group chat #${conversation.id}`;
  }

  return "Direct chat";
}

export function getConversationSubtitle(conversation: ChatConversation, currentUserId?: string | number) {
  if (conversation.type === "GROUP") {
    return `${conversation.members.length} members`;
  }

  const otherMember = conversation.members.find(
    (member) => String(member.userId) !== String(currentUserId),
  );
  return otherMember?.user?.name ?? "Direct message";
}

export function formatTime(input?: string | Date | null) {
  if (!input) return "";

  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatConversationTime(input?: string | null) {
  if (!input) return "";

  const date = new Date(input);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return formatTime(date);
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function avatarFallback(user?: ChatUser | null) {
  return user?.name?.slice(0, 2).toUpperCase() ?? "??";
}

export function shouldSignOutFromError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /unauthor|jwt expired|token expired/i.test(message);
}

export function redirectToSignOut() {
  if (typeof window !== "undefined") {
    window.location.assign("/api/auth/signout");
  }
}
