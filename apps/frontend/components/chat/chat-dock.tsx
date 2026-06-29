"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleStackIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import { BACKEND_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/session";
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
  createDirectConversation,
  fetchConversations,
  fetchFriends,
  fetchMessages,
  markConversationRead,
} from "@/lib/chat";

type SocketMessage = ChatMessage;

type Props = {
  session: Session | null;
};

type SocketState = "idle" | "connecting" | "connected";
type SidebarTab = "chats" | "friends";

function getConversationLabel(conversation: ChatConversation, currentUserId?: string) {
  if (conversation.title) return conversation.title;

  const otherMember = conversation.members.find((member) => String(member.userId) !== currentUserId);
  if (otherMember?.user?.name) return otherMember.user.name;

  if (conversation.type === "GROUP") {
    return `Group chat #${conversation.id}`;
  }

  return "Direct chat";
}

function getConversationSubtitle(conversation: ChatConversation, currentUserId?: string) {
  if (conversation.type === "GROUP") {
    return `${conversation.members.length} members`;
  }

  const otherMember = conversation.members.find((member) => String(member.userId) !== currentUserId);
  return otherMember?.user?.name ?? "Direct message";
}

function formatTime(input?: string | Date | null) {
  if (!input) return "";

  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatConversationTime(input?: string | null) {
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

function avatarFallback(user?: ChatUser | null) {
  return user?.name?.slice(0, 2).toUpperCase() ?? "??";
}

export default function ChatDock({ session }: Props) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeConversationRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [activeTab, setActiveTab] = useState<SidebarTab>("chats");
  const [friendFilter, setFriendFilter] = useState("");
  const [socketState, setSocketState] = useState<SocketState>("idle");

  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations", session?.accessToken],
    queryFn: () => fetchConversations(session!),
    enabled: !!session?.accessToken,
    staleTime: 10_000,
  });

  const friendsQuery = useQuery({
    queryKey: ["chat", "friends", session?.accessToken],
    queryFn: () => fetchFriends(session!),
    enabled: !!session?.accessToken && isOpen,
    staleTime: 30_000,
  });

  const activeConversation = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversationsQuery.data, selectedConversationId],
  );

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", session?.accessToken, selectedConversationId],
    queryFn: () => fetchMessages(session!, selectedConversationId!),
    enabled: !!session?.accessToken && !!selectedConversationId && isOpen,
    staleTime: 2_000,
  });

  useEffect(() => {
    activeConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    if (!session?.accessToken) return;

    setSocketState("connecting");
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${session.accessToken}`,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketState("connected");
    });

    socket.on("disconnect", () => {
      setSocketState("idle");
    });

    socket.on("connect_error", () => {
      setSocketState("idle");
    });

    socket.on("message:new", (message: SocketMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["chat", "messages", session.accessToken, message.conversationId],
        (current) => {
          if (!current) return [message];
          const exists = current.some((item) => item.id === message.id);
          return exists ? current : [...current, message];
        },
      );

      queryClient.setQueryData<ChatConversation[]>(
        ["chat", "conversations", session.accessToken],
        (current) => {
          if (!current) return current;

          return current.map((conversation) => {
            if (conversation.id !== message.conversationId) return conversation;
            return {
              ...conversation,
              lastMessage: message,
              lastMessageId: message.id,
              updatedAt: message.createdAt,
            };
          });
        },
      );

      if (activeConversationRef.current === message.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", session.accessToken, message.conversationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversations", session.accessToken],
        });
      }
    });

    socket.on("conversation:updated", () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations", session.accessToken],
      });
    });

    socket.on("conversation:read", (payload: { conversationId: number; lastReadAt: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations", session.accessToken],
      });

      queryClient.setQueryData<ChatConversation[]>(
        ["chat", "conversations", session.accessToken],
        (current) => {
          if (!current) return current;
          return current.map((conversation) =>
            conversation.id === payload.conversationId
              ? {
                  ...conversation,
                  members: conversation.members.map((member) =>
                    member.userId === Number(session.user.id)
                      ? { ...member, lastReadAt: payload.lastReadAt }
                      : member,
                  ),
                }
              : conversation,
          );
        },
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setSocketState("idle");
    };
  }, [queryClient, session]);

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedConversationId && conversationsQuery.data?.length) {
      setSelectedConversationId(conversationsQuery.data[0].id);
    }
  }, [conversationsQuery.data, isOpen, selectedConversationId]);

  useEffect(() => {
    if (!isOpen || !selectedConversationId || !socketRef.current) return;
    socketRef.current.emit("conversation:join", { conversationId: selectedConversationId });
  }, [isOpen, selectedConversationId]);

  useEffect(() => {
    if (!isOpen || !selectedConversationId || !session?.accessToken) return;
    void markConversationRead(session, selectedConversationId).then(() => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations", session.accessToken],
      });
    });
  }, [isOpen, selectedConversationId, queryClient, session]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messagesQuery.data, selectedConversationId, isOpen]);

  const unreadCount =
    conversationsQuery.data && session?.user?.id
      ? conversationsQuery.data.reduce((count, conversation) => {
          if (conversation.id === selectedConversationId && isOpen) return count;

          const lastMessage = conversation.lastMessage;
          if (!lastMessage) return count;

          const me = conversation.members.find((member) => String(member.userId) === String(session.user.id));
          const lastReadAt = me?.lastReadAt ? new Date(me.lastReadAt).getTime() : 0;
          const messageTime = new Date(lastMessage.createdAt).getTime();
          return messageTime > lastReadAt ? count + 1 : count;
        }, 0)
      : 0;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!session?.accessToken) throw new Error("Missing session");
      if (!selectedConversationId) throw new Error("Select a conversation first");
      if (!socketRef.current || socketState !== "connected") {
        throw new Error("Socket disconnected");
      }

      return new Promise<SocketMessage>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Message timeout")), 10_000);

        socketRef.current?.emit(
          "message:send",
          {
            conversationId: selectedConversationId,
            content,
            type: "TEXT",
          },
          (response: { data?: SocketMessage; message?: string }) => {
            clearTimeout(timer);
            if (response?.data) {
              resolve(response.data);
              return;
            }
            if (response && "id" in response) {
              resolve(response as SocketMessage);
              return;
            }
            reject(new Error(response?.message || "Failed to send message"));
          },
        );
      });
    },
    onMutate: async (content) => {
      const nextDraft = content.trim();
      if (nextDraft) {
        setMessageDraft("");
      }

      return { previousDraft: content };
    },
    onError: (_error, _content, context) => {
      if (context?.previousDraft) {
        setMessageDraft(context.previousDraft);
      }
    },
    onSuccess: async () => {
      if (selectedConversationId && session?.accessToken) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["chat", "messages", session.accessToken, selectedConversationId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["chat", "conversations", session.accessToken],
          }),
        ]);
      }
    },
  });

  const createDirectMutation = useMutation({
    mutationFn: async (participantId: number) => {
      if (!session) throw new Error("Missing session");
      return createDirectConversation(session, participantId);
    },
    onSuccess: async (conversation) => {
      setSelectedConversationId(conversation.id);
      setIsOpen(true);
      setActiveTab("chats");
      if (session?.accessToken) {
        await queryClient.invalidateQueries({
          queryKey: ["chat", "conversations", session.accessToken],
        });
      }
    },
  });

  const activeMessages = messagesQuery.data ?? [];

  if (!session) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/auth/signin"
          className="group flex items-center gap-3 rounded-full border border-border bg-background/95 px-4 py-3 text-sm shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
            <ChatBubbleLeftRightIcon className="size-5" />
          </span>
          <span className="flex flex-col text-left">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Chat
            </span>
            <span className="font-medium">Sign in to message</span>
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-2 md:inset-x-auto md:right-4 md:bottom-4 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[calc(100vw-1rem)] max-w-[920px] overflow-hidden rounded-[1.5rem] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,248,246,0.92))] shadow-[0_24px_100px_-28px_rgba(0,0,0,0.45)] backdrop-blur-2xl dark:bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(18,18,18,0.92))]">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-background">
                <ChatBubbleLeftRightIcon className="size-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Messages
                </p>
                <p className="text-sm font-medium text-foreground">
                  {socketState === "connected" ? "Live" : "Connecting..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <XMarkIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid h-[85dvh] min-h-0 overflow-hidden md:h-[min(72vh,760px)] grid-cols-1 md:grid-cols-[320px_1fr]">
            <aside className={cn(
              "flex h-full min-h-0 flex-col border-b border-border/70 md:border-b-0 md:border-r",
              isMobile && showMobileChat && "hidden"
            )}>
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
                  conversationsQuery.isLoading ? (
                    <div className="p-4 space-y-3">
                      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                    </div>
                  ) : conversationsQuery.data?.length ? (
                    <div className="p-2">
                      {conversationsQuery.data.map((conversation) => {
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

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => {
                              setSelectedConversationId(conversation.id);
                              if (isMobile) setShowMobileChat(true);
                            }}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                              isActive ? "bg-foreground text-background" : "hover:bg-muted",
                            )}
                          >
                            <Avatar className="mt-0.5 size-10 shrink-0 border border-border/80">
                              <AvatarImage src={conversation.members.find((member) => String(member.userId) !== String(session.user.id))?.user.avatar ?? undefined} />
                              <AvatarFallback className={isActive ? "bg-background text-foreground" : ""}>
                                {avatarFallback(
                                  conversation.members.find(
                                    (member) => String(member.userId) !== String(session.user.id),
                                  )?.user,
                                )}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="truncate text-sm font-semibold">{label}</p>
                                  <p
                                    className={cn(
                                      "truncate text-[11px] uppercase tracking-[0.2em]",
                                      isActive ? "text-background/70" : "text-muted-foreground",
                                    )}
                                  >
                                    {subtitle}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {lastMessageAt ? (
                                    <span
                                      className={cn(
                                        "text-[10px] uppercase tracking-[0.2em]",
                                        isActive ? "text-background/60" : "text-muted-foreground",
                                      )}
                                    >
                                      {lastMessageAt}
                                    </span>
                                  ) : null}
                                  {unread ? (
                                    <span
                                      className={cn(
                                        "size-2 rounded-full",
                                        isActive ? "bg-background" : "bg-foreground",
                                      )}
                                    />
                                  ) : null}
                                </div>
                              </div>
                              <p
                                className={cn(
                                  "mt-2 line-clamp-2 text-sm",
                                  isActive ? "text-background/80" : "text-muted-foreground",
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
                      {friendsQuery.isLoading ? (
                        <div className="p-4 space-y-3">
                          <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                          <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                          <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                        </div>
                      ) : friendsQuery.data?.length ? (
                        <div className="p-2">
                          {friendsQuery.data
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
                                onClick={() => createDirectMutation.mutate(friend.id)}
                                disabled={createDirectMutation.isPending}
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
                              >
                                <Avatar className="size-10 border border-border/80">
                                  <AvatarImage src={friend.avatar ?? undefined} />
                                  <AvatarFallback>
                                    {avatarFallback(friend)}
                                  </AvatarFallback>
                                </Avatar>
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
                          {friendsQuery.data.filter((friend) => {
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

            <section className={cn(
              "flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]",
              isMobile && !showMobileChat && "hidden"
            )}>
              {activeConversation ? (
                <>
                  <div className="shrink-0 flex items-center justify-between border-b border-border/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {isMobile && (
                        <button
                          type="button"
                          onClick={() => setShowMobileChat(false)}
                          className="flex shrink-0 items-center justify-center rounded-full p-1.5 text-muted-foreground hover:bg-muted -ml-1"
                        >
                          <ArrowLeftIcon className="size-5" />
                        </button>
                      )}
                      <Avatar className="size-10 border border-border/80">
                        <AvatarImage
                          src={
                            activeConversation.members.find(
                              (member) => String(member.userId) !== String(session.user.id),
                            )?.user.avatar ?? undefined
                          }
                        />
                        <AvatarFallback>
                          {avatarFallback(
                            activeConversation.members.find(
                              (member) => String(member.userId) !== String(session.user.id),
                            )?.user,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {getConversationLabel(activeConversation, session.user.id)}
                        </p>
                        <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {getConversationSubtitle(activeConversation, session.user.id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <CircleStackIcon className="size-4" />
                      {socketState}
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
                  >
                    {messagesQuery.isLoading ? (
                      <>
                        <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-muted" />
                        <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-16 w-1/2 animate-pulse rounded-2xl bg-muted" />
                      </>
                    ) : activeMessages.length ? (
                      activeMessages.map((message) => {
                        const mine = String(message.senderId) === String(session.user.id);
                        return (
                          <div
                            key={message.id}
                            className={cn("flex", mine ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[82%] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed",
                                mine
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-foreground",
                              )}
                            >
                              {!mine ? (
                                <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                                  {message.sender?.name ?? "Member"}
                                </p>
                              ) : null}
                              {message.type === "TEXT" ? (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              ) : message.attachmentUrl ? (
                                <a
                                  href={message.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline underline-offset-4"
                                >
                                  Open attachment
                                </a>
                              ) : (
                                <p>{message.content ?? "Message"}</p>
                              )}
                              <p
                                className={cn(
                                  "mt-2 text-[10px] uppercase tracking-[0.2em]",
                                  mine ? "text-background/70" : "text-muted-foreground",
                                )}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                          <ChatBubbleLeftRightIcon className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold">Start the conversation</h3>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                          Send the first message to open up this thread.
                        </p>
                      </div>
                    )}
                  </div>

                  <form
                    className="shrink-0 border-t border-border/70 p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (sendMessageMutation.isPending) return;
                      const content = messageDraft.trim();
                      if (!content) return;
                      sendMessageMutation.mutate(content);
                    }}
                  >
                    <div className="rounded-[1.25rem] border border-border bg-background p-3 shadow-inner">
                      <Textarea
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            const content = messageDraft.trim();
                            if (!sendMessageMutation.isPending && content) {
                              sendMessageMutation.mutate(content);
                            }
                          }
                        }}
                        placeholder="Write a message..."
                        rows={3}
                        className="max-h-32 min-h-16 resize-none overflow-y-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                      />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          Enter to send
                        </p>
                        <Button
                          type="submit"
                          className="rounded-full px-4"
                          disabled={sendMessageMutation.isPending || !messageDraft.trim()}
                        >
                          <PaperAirplaneIcon className="size-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-border bg-muted">
                      <ChatBubbleLeftRightIcon className="size-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Pick a thread from the left to start messaging.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      <Button
        onClick={() => {
          setIsOpen((value) => {
            if (value) {
              setShowMobileChat(false);
            }
            return !value;
          });
        }}
        className={cn(
          "group h-14 rounded-full px-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)]",
          isOpen ? "bg-foreground text-background" : "bg-foreground text-background",
        )}
        aria-expanded={isOpen}
        aria-label="Toggle chat"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-background/10">
          {isOpen ? <XMarkIcon className="size-5" /> : <ChatBubbleLeftRightIcon className="size-5" />}
        </span>
        <span className="flex flex-col items-start gap-0.5 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/65">
            Messenger
          </span>
          <span className="text-sm font-semibold">
            {isOpen ? "Close chat" : unreadCount ? `${unreadCount} unread` : "Open chat"}
          </span>
        </span>
        {unreadCount ? (
          <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-background text-foreground text-xs font-semibold">
            {unreadCount}
          </span>
        ) : null}
      </Button>
    </div>
  );
}
