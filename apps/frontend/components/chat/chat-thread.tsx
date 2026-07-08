"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatConversation, ChatMessage } from "@/lib/chat";
import type { Session } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import type { RefObject } from "react";
import ChatCallPanel from "./chat-call-panel";
import {
  avatarFallback,
  formatTime,
  getConversationLabel,
  getConversationSubtitle,
  type ChatCallState,
} from "./chat-utils";

function MessageStatus({ status }: { status?: "sending" | "sent" | "failed" }) {
  if (status === "sending") {
    return (
      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-foreground/40" />
        Sending...
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-red-400">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-1-2.732-.5-1.732.833-1.732 1.272-1.732 4.5z" />
        </svg>
        Failed
      </span>
    );
  }
  if (status === "sent") {
    return (
      <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  return null;
}

type Props = {
  session: Session;
  activeConversation: ChatConversation | null;
  isMobile: boolean;
  onBack: () => void;
  socketState: "idle" | "connecting" | "connected";
  incomingCall: { conversationId: number; fromUserId: number } | null;
  callState: ChatCallState;
  localVideoStream: MediaStream | null;
  remoteVideoStream: MediaStream | null;
  startCall: () => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  messagesLoading: boolean;
  activeMessages: ChatMessage[];
  messageDraft: string;
  setMessageDraft: (value: string) => void;
  onSendMessage: (content: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
};

export default function ChatThread({
  session,
  activeConversation,
  isMobile,
  onBack,
  socketState,
  incomingCall,
  callState,
  localVideoStream,
  remoteVideoStream,
  startCall,
  acceptCall,
  rejectCall,
  endCall,
  messagesLoading,
  activeMessages,
  messageDraft,
  setMessageDraft,
  onSendMessage,
  scrollRef,
  localVideoRef,
  remoteVideoRef,
}: Props) {
  if (!activeConversation) {
    return (
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
    );
  }

  const handleSubmit = () => {
    const content = messageDraft.trim();
    if (!content) return;
    onSendMessage(content);
  };

  const otherMember = activeConversation.members.find(
    (member) => String(member.userId) !== String(session.user.id),
  );
  const headerProfileHref = otherMember?.user?.name
    ? `/user/${encodeURIComponent(otherMember.user.name)}`
    : null;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={onBack}
              className="-ml-1 flex shrink-0 items-center justify-center rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <ArrowLeftIcon className="size-5" />
            </button>
          )}
          {headerProfileHref ? (
            <Link href={headerProfileHref} className="hover:opacity-80 transition-opacity">
              <Avatar className="size-10 border border-border/80">
                <AvatarImage src={otherMember?.user?.avatar ?? undefined} />
                <AvatarFallback>
                  {avatarFallback(otherMember?.user)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="size-10 border border-border/80">
              <AvatarImage
                src={otherMember?.user?.avatar ?? undefined}
              />
              <AvatarFallback>
                {avatarFallback(otherMember?.user)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {getConversationLabel(activeConversation, session.user.id)}
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {getConversationSubtitle(activeConversation, session.user.id)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startCall}
          disabled={callState !== "idle"}
          className="flex items-center justify-center rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          <VideoCameraIcon className="size-5" />
        </button>
      </div>

      {incomingCall && callState === "incoming" ? (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/60 px-4 py-3">
          <p className="text-sm font-medium">Incoming video call…</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={acceptCall}
              className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={rejectCall}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        </div>
      ) : null}

      <ChatCallPanel
        callState={callState}
        localVideoStream={localVideoStream}
        remoteVideoStream={remoteVideoStream}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onEndCall={endCall}
      />

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
        {messagesLoading ? (
          <>
            <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-muted" />
            <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 w-1/2 animate-pulse rounded-2xl bg-muted" />
          </>
        ) : activeMessages.length ? (
          activeMessages.map((message) => {
            const mine = String(message.senderId) === String(session.user.id);
            return (
              <div key={message.tempId ?? message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed",
                    mine ? "bg-foreground text-background" : "bg-muted text-foreground",
                  )}
                >
                  {!mine ? (
                    <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {message.sender?.name ?? "Member"}
                    </p>
                  ) : null}
                  {message.type === "TEXT" ? (
                    <p
                      className={cn(
                        "whitespace-pre-wrap",
                        message.status === "failed" && "cursor-pointer underline decoration-red-400/50 underline-offset-2",
                      )}
                      onClick={() => {
                        if (message.status === "failed" && message.content) {
                          onSendMessage(message.content);
                        }
                      }}
                    >
                      {message.content}
                    </p>
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
                  <div className={cn("mt-1 flex items-center gap-1.5", mine ? "text-background/70" : "text-muted-foreground")}>
                    <span className="text-[10px] uppercase tracking-[0.2em]">{formatTime(message.createdAt)}</span>
                    {mine && <MessageStatus status={message.status} />}
                  </div>
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
          handleSubmit();
        }}
      >
        <div className="rounded-[1.25rem] border border-border bg-background p-3 shadow-inner">
          <Textarea
            value={messageDraft}
            onChange={(event) => {
              setMessageDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
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
            <Button type="submit" className="rounded-full px-4" disabled={!messageDraft.trim()}>
              <PaperAirplaneIcon className="size-4" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
