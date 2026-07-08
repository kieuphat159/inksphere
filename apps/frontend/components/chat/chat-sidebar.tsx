"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { ChatConversation, ChatFriend } from "@/lib/chat";
import type { Session } from "@/lib/session";
import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import {
  avatarFallback,
  formatConversationTime,
  getConversationLabel,
  getConversationSubtitle,
  type SidebarTab,
} from "./chat-utils";

type Props = {
  session: Session;
  activeTab: SidebarTab;
  setActiveTab: Dispatch<SetStateAction<SidebarTab>>;
  isMobile: boolean;
  showMobileChat: boolean;
  selectedConversationId: number | null;
  conversations: ChatConversation[] | undefined;
  conversationsLoading: boolean;
  friends: ChatFriend[] | undefined;
  friendsLoading: boolean;
  friendFilter: string;
  setFriendFilter: Dispatch<SetStateAction<string>>;
  onSelectConversation: (conversationId: number) => void;
  onCreateConversation: (participantId: number) => void;
  createDirectPending: boolean;
};

export default function ChatSidebar({
  session,
  activeTab,
  setActiveTab,
  isMobile,
  showMobileChat,
  selectedConversationId,
  conversations,
  conversationsLoading,
  friends,
  friendsLoading,
  friendFilter,
  setFriendFilter,
  onSelectConversation,
  onCreateConversation,
  createDirectPending,
}: Props) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-b border-border/70 md:border-b-0 md:border-r",
        isMobile && showMobileChat && "hidden",
      )}
    >
      <div className="border-b border-border/70 p-4">
        <div className="flex rounded-full border border-border p-1">
          <button
            type="button"
            onClick={() => setActiveTab("chats")}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-[10px] font-mono uppercase tracking-[0.25em] transition-colors",
              activeTab === "chats"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Chats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("friends")}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-[10px] font-mono uppercase tracking-[0.25em] transition-colors",
              activeTab === "friends"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Friends
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "chats" ? (
          conversationsLoading ? (
            <div className="space-y-3 p-4">
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            </div>
          ) : conversations?.length ? (
            <div className="p-2">
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;
                const label = getConversationLabel(conversation, session.user.id);
                const subtitle = getConversationSubtitle(conversation, session.user.id);
                const lastMessageText = conversation.lastMessage?.content?.trim()
                  ? conversation.lastMessage.content
                  : conversation.lastMessage?.attachmentUrl
                    ? "Attachment"
                    : "No messages yet";
                const lastMessageAt = formatConversationTime(conversation.lastMessage?.createdAt);
                const unread =
                  conversation.lastMessage &&
                  new Date(conversation.lastMessage.createdAt).getTime() >
                    new Date(
                      conversation.members.find(
                        (member) => String(member.userId) === String(session.user.id),
                      )?.lastReadAt ?? 0,
                    ).getTime();

                const otherMember = conversation.members.find(
                  (member) => String(member.userId) !== String(session.user.id),
                );
                const profileHref = otherMember?.user?.name
                  ? `/user/${encodeURIComponent(otherMember.user.name)}`
                  : null;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                      isActive ? "bg-foreground text-background" : "hover:bg-muted",
                    )}
                  >
                    {profileHref ? (
                      <Link
                        href={profileHref}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="size-10 border border-border/80">
                          <AvatarImage src={otherMember?.user?.avatar ?? undefined} />
                          <AvatarFallback>{avatarFallback(otherMember?.user)}</AvatarFallback>
                        </Avatar>
                      </Link>
                    ) : (
                      <Avatar className="mt-0.5 size-10 shrink-0 border border-border/80">
                        <AvatarImage src={otherMember?.user?.avatar ?? undefined} />
                        <AvatarFallback>{avatarFallback(otherMember?.user)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{label}</p>
                        {lastMessageAt && (
                          <span
                            className={cn(
                              "shrink-0 text-[10px] uppercase tracking-[0.2em]",
                              isActive ? "text-background/70" : "text-muted-foreground",
                            )}
                          >
                            {lastMessageAt}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 truncate text-[11px] uppercase tracking-[0.2em]",
                          isActive ? "text-background/70" : "text-muted-foreground",
                          unread && !isActive && "font-semibold text-foreground",
                        )}
                      >
                        {lastMessageText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                <PencilSquareIcon className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">No conversations yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Open the Friends tab to start a direct chat.
              </p>
            </div>
          )
        ) : (
          <div className="flex h-full flex-col">
            <div className="border-b border-border/70 p-4">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={friendFilter}
                  onChange={(event) => setFriendFilter(event.target.value)}
                  placeholder="Search your friends..."
                  className="h-11 rounded-full pl-10 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {friendsLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                  <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                  <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                </div>
              ) : friends?.length ? (
                <div className="p-2">
                  {friends
                    .filter((friend) => {
                      const query = friendFilter.trim().toLowerCase();
                      if (!query) return true;
                      return (
                        friend.name.toLowerCase().includes(query) ||
                        friend.email.toLowerCase().includes(query)
                      );
                    })
                    .map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => onCreateConversation(friend.id)}
                        disabled={createDirectPending}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        <Link
                          href={`/user/${encodeURIComponent(friend.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="size-10 border border-border/80">
                            <AvatarImage src={friend.avatar ?? undefined} />
                            <AvatarFallback>{avatarFallback(friend)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{friend.name}</p>
                          <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            {friend.bio || friend.email}
                          </p>
                        </div>
                        <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.25em]">
                          Message
                        </span>
                      </button>
                    ))}
                  {friends.filter((friend) => {
                    const query = friendFilter.trim().toLowerCase();
                    if (!query) return true;
                    return (
                      friend.name.toLowerCase().includes(query) ||
                      friend.email.toLowerCase().includes(query)
                    );
                  }).length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                        <MagnifyingGlassIcon className="size-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-semibold">No matching friends</h3>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        Try another name or switch back to chats.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                    <PlusIcon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold">No friends yet</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Add some friends first, then come back here to start a direct chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
