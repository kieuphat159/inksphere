"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

const PostContent = ({ html, className }: Props) => {
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const purify = DOMPurify(window);
      setSanitizedHtml(purify.sanitize(html));
    }
  }, [html]);

  return (
    <div
      className={cn(
        "editorial-content max-w-none text-foreground/90",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default PostContent;
