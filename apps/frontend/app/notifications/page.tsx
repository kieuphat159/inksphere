"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/lib/actions/sessionAction";
import { SessionUser } from "@/lib/types/modelTypes";
import {
  fetchMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsReadAction,
} from "@/lib/actions/notificationAction";
import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";

const NotificationsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 15;

  useEffect(() => {
    const checkUser = async () => {
      const session = await getClientSession();
      if (!session?.user) {
        router.push("/auth/signin");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  const loadNotifications = async (p: number, append = false) => {
    setIsLoading(true);
    const skip = (p - 1) * pageSize;
    const data = await fetchMyNotifications(skip, pageSize);
    
    if (data.length < pageSize) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }

    if (append) {
      setNotifications((prev) => [...prev, ...data]);
    } else {
      setNotifications(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadNotifications(page);
    }
  }, [user, page]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }

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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7" /> Notifications
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
            Stay updated with likes, comments, and friend requests.
          </p>
        </div>
        
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="w-fit font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-colors px-4 py-2 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-col border border-border/60 divide-y divide-border/60">
        {isLoading && notifications.length === 0 ? (
          <div className="py-24 text-center font-mono text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center font-serif italic text-muted-foreground bg-muted/5">
            You don't have any notifications yet.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 transition-all flex items-start gap-4 cursor-pointer hover:bg-muted/10 ${
                !notif.isRead ? "bg-muted/20 border-l-2 border-foreground" : "bg-transparent"
              }`}
            >
              {notif.actor?.avatar ? (
                <img
                  src={notif.actor.avatar}
                  alt={notif.actor.name}
                  className="w-10 h-10 object-cover grayscale border border-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center font-mono text-xs text-muted-foreground shrink-0">
                  {notif.actor?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-grow min-w-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-sm text-foreground/90 font-sans leading-snug">
                    <span className="font-mono font-bold text-foreground mr-1.5 hover:underline">
                      {notif.actor?.name}
                    </span>
                    {notif.type === "POST_LIKED" && "liked your essay"}
                    {notif.type === "POST_COMMENTED" && "commented on your essay"}
                    {notif.type === "FRIEND_REQUEST_RECEIVED" && "sent you a friend request"}
                    {notif.type === "FRIEND_REQUEST_ACCEPTED" && "accepted your friend request"}
                  </p>
                  {notif.post && (
                    <span className="font-serif italic text-xs text-muted-foreground mt-0.5 block">
                      "{notif.post.title}"
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-1 sm:mt-0">
                  {new Date(notif.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && notifications.length > 0 && (
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading}
          className="mt-6 mx-auto w-fit font-mono text-[10px] uppercase tracking-widest border border-border hover:bg-muted transition-colors px-6 py-2.5 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Load More"}
        </button>
      )}
    </main>
  );
};

export default NotificationsPage;
