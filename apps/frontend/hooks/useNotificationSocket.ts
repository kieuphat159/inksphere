"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/constants";
import { SessionUser } from "@/lib/types/modelTypes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useNotificationSocket = (
  user?: SessionUser,
  onNotificationReceived?: (notification: any) => void
) => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Store the callback in a ref to avoid recreating the socket listener when it changes
  const callbackRef = useRef(onNotificationReceived);
  useEffect(() => {
    callbackRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!user || !user.accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = `${BACKEND_URL}/notifications`;
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      auth: {
        token: user.accessToken,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to notifications namespace");
    });

    newSocket.on("notification", (notification: any) => {
      // Trigger callback to update counts or notification list on UI
      if (callbackRef.current) {
        callbackRef.current(notification);
      }

      // Show real-time popup (Sonner Toast)
      let message = "You have a new notification";
      let url = "/notifications";

      if (notification.type === "POST_LIKED") {
        message = `${notification.actor?.name || "Someone"} liked your post "${notification.post?.title || ""}"`;
        url = `/blog/${notification.post?.slug}/${notification.post?.id}`;
      } else if (notification.type === "POST_COMMENTED") {
        message = `${notification.actor?.name || "Someone"} commented on your post "${notification.post?.title || ""}"`;
        url = `/blog/${notification.post?.slug}/${notification.post?.id}`;
      } else if (notification.type === "FRIEND_REQUEST_RECEIVED") {
        message = `${notification.actor?.name || "Someone"} sent you a friend request`;
        url = "/user/friends";
      } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
        message = `${notification.actor?.name || "Someone"} accepted your friend request`;
        url = `/user/${encodeURIComponent(notification.actor?.name || "")}`;
      }

      toast(message, {
        action: {
          label: "View",
          onClick: () => router.push(url),
        },
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.accessToken]);

  return { socket };
};
