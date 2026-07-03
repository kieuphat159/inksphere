"use client";

import { Button } from "@/components/ui/button";
import type { RefObject } from "react";
import type { ChatCallState } from "./chat-utils";

type Props = {
  callState: ChatCallState;
  localVideoStream: MediaStream | null;
  remoteVideoStream: MediaStream | null;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  onEndCall: () => void;
};

export default function ChatCallPanel({
  callState,
  localVideoStream,
  remoteVideoStream,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
}: Props) {
  if (callState !== "calling" && callState !== "connected") return null;

  return (
    <div className="border-b border-border/70 bg-black/90 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-white/80">
        <span>{callState === "connected" ? "Call in progress" : "Calling…"}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.25em]">
            {callState === "connected" ? "Live" : "Connecting"}
          </span>
          <Button
            className="h-6 rounded-full border border-white/15 px-2 text-[10px] uppercase tracking-[0.25em]"
            type="button"
            variant="destructive"
            size="sm"
            onClick={onEndCall}
          >
            End call
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/80 text-center text-sm text-white/70">
          {localVideoStream ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="px-4">
              <p className="font-medium text-white">Your camera</p>
              <p className="mt-1 text-xs text-white/60">Permission may be blocked or unavailable.</p>
            </div>
          )}
        </div>
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/80 text-center text-sm text-white/70">
          {remoteVideoStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="px-4">
              <p className="font-medium text-white">Remote video</p>
              <p className="mt-1 text-xs text-white/60">Waiting for the other participant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
