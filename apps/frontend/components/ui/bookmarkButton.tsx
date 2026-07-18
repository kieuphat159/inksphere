"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { bookmarkPostAction, removeBookmarkAction, fetchIsBookmarked } from "@/lib/actions/bookmarkAction";
import { SessionUser } from "@/lib/types/modelTypes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  postId: number;
  user?: SessionUser;
  className?: string;
};

const BookmarkButton = ({ postId, user, className }: Props) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const bookmarked = await fetchIsBookmarked(postId);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error(error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [postId, user]);

  const handleToggle = async () => {
    if (!user) {
      toast.error("Please sign in to save this essay.");
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        const success = await removeBookmarkAction(postId);
        if (success) {
          setIsBookmarked(false);
          toast.success("Removed from bookmarks");
        } else {
          toast.error("Failed to remove bookmark");
        }
      } else {
        const success = await bookmarkPostAction(postId);
        if (success) {
          setIsBookmarked(true);
          toast.success("Saved to bookmarks");
        } else {
          toast.error("Failed to save bookmark");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className={className}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-sm border border-border/40 hover:border-border bg-background hover:bg-muted/30 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center ${className}`}
      title={isBookmarked ? "Remove from Bookmarks" : "Bookmark Essay"}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-foreground fill-foreground" />
      ) : (
        <Bookmark className="w-4 h-4 text-foreground" />
      )}
    </button>
  );
};

export default BookmarkButton;
