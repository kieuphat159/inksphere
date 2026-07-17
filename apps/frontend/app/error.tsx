"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="space-y-2">
        <h1 className="font-serif italic text-4xl md:text-5xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          An unexpected error occurred while rendering this page. We've logged this issue and are working to resolve it.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="font-mono text-xs uppercase tracking-widest bg-foreground text-background px-6 py-3 rounded hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest border border-border px-6 py-3 rounded hover:bg-muted/30 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
