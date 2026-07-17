import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="space-y-2">
        <h1 className="font-serif italic text-6xl font-bold text-foreground">404</h1>
        <h2 className="font-serif italic text-2xl font-semibold text-foreground/90">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest bg-foreground text-background px-6 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
