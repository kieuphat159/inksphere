"use client";

import { useState } from "react";
import { saveComment } from "@/lib/actions/commentAction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SessionUser } from "@/lib/session";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  postId: number;
  parentId: number;
  user: SessionUser;
  onSuccess: () => void;
  onCancel: () => void;
};

const ReplyComment = ({ postId, parentId, user, onSuccess, onCancel }: Props) => {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("postId", String(postId));
    formData.append("parentId", String(parentId));
    formData.append("content", content);

    try {
      const res = await saveComment({ data: {} }, formData);
      if (res?.ok) {
        toast.success("Reply added successfully!");
        setContent("");
        onSuccess();
      } else {
        setError(res?.errors?.content?.[0] || res?.message || "Failed to add reply");
        toast.error("Failed to add reply");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 w-full max-w-lg">
      <div className="flex flex-col gap-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="text-xs p-2.5 border-border focus-visible:ring-foreground/10 font-serif leading-relaxed resize-none min-h-[70px]"
          rows={2}
          required
        />
        {error && (
          <p className="text-red-600 font-mono text-[9px] uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          size="sm"
          className="h-7 text-[10px] font-mono uppercase tracking-widest px-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : null}
          Reply
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="h-7 text-[10px] font-mono uppercase tracking-widest px-3"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ReplyComment;
