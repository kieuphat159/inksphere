export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-t-foreground animate-spin" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
        Loading InkSphere
      </p>
    </div>
  );
}
