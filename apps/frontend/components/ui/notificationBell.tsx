"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { SessionUser } from "@/lib/types/modelTypes";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import {
  fetchMyNotifications,
  fetchUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsReadAction,
} from "@/lib/actions/notificationAction";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  user?: SessionUser;
};

const NotificationBell = ({ user }: Props) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Hook handles real-time increments via callback
  useNotificationSocket(user, () => {
    setUnreadCount((prev) => prev + 1);
    if (isOpen) {
      loadNotifications();
    }
  });

  // Fetch initial unread count
  useEffect(() => {
    if (!user) return;

    const getInitialCount = async () => {
      const count = await fetchUnreadNotificationsCount();
      setUnreadCount(count);
    };
    getInitialCount();
  }, [user]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyNotifications(0, 5);
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsReadAction();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);

    let url = "/notifications";
    if (notif.type === "POST_LIKED" || notif.type === "POST_COMMENTED") {
      url = `/blog/${notif.post?.slug}/${notif.post?.id}`;
    } else if (notif.type === "FRIEND_REQUEST_RECEIVED") {
      url = "/user/friends";
    } else if (notif.type === "FRIEND_REQUEST_ACCEPTED") {
      url = `/user/${encodeURIComponent(notif.actor?.name || "")}`;
    }
    router.push(url);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-sm border border-transparent hover:border-border hover:bg-muted/40 transition-all focus:outline-none"
      >
        <Bell className="w-4 h-4 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-mono font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 border border-border bg-background shadow-2xl p-2 z-50 flex flex-col rounded-none"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2 px-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
            {isLoading && notifications.length === 0 && (
              <div className="py-8 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="py-8 text-center text-xs font-serif italic text-muted-foreground">
                No notifications yet.
              </div>
            )}

            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left px-2.5 py-2 hover:bg-muted transition-colors flex items-start gap-2.5 border-b border-border/10 last:border-b-0 ${
                  !notif.isRead ? "bg-muted/10 font-bold" : ""
                }`}
              >
                {notif.actor?.avatar ? (
                  <img
                    src={notif.actor.avatar}
                    alt={notif.actor.name}
                    className="w-6 h-6 object-cover grayscale shrink-0 border border-border/40"
                  />
                ) : (
                  <div className="w-6 h-6 bg-muted border border-border/40 flex items-center justify-center font-mono text-[9px] text-muted-foreground shrink-0">
                    {notif.actor?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs text-foreground/90 font-sans leading-snug break-words">
                    <span className="font-mono font-bold text-foreground mr-1">
                      {notif.actor?.name}
                    </span>
                    {notif.type === "POST_LIKED" && "liked your essay"}
                    {notif.type === "POST_COMMENTED" && "commented on your essay"}
                    {notif.type === "FRIEND_REQUEST_RECEIVED" && "sent you a friend request"}
                    {notif.type === "FRIEND_REQUEST_ACCEPTED" && "accepted your friend request"}
                  </p>
                  {notif.post && (
                    <span className="font-serif italic text-[10px] text-muted-foreground truncate">
                      "{notif.post.title}"
                    </span>
                  )}
                  <span className="font-mono text-[8px] text-muted-foreground/60">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full py-2 text-[10px] font-mono uppercase tracking-widest text-center border-t border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
