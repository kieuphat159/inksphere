"use client";

import dynamic from "next/dynamic";
import { SessionUser } from "@/lib/session";

const ChatDockLazy = dynamic(() => import("./chat-dock"), {
  ssr: false,
});

export default function ChatDockWrapper({ session }: { session: { user?: SessionUser; accessToken?: string } | null }) {
  if (!session?.user) return null;
  return <ChatDockLazy session={session as any} />;
}
