"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { searchPostsAndUsers } from "@/lib/actions/searchAction";
import { Post, User } from "@/lib/types/modelTypes";
import Link from "next/link";

const SearchBar = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ posts: Post[]; users: User[] }>({ posts: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Debounced search logic
  useEffect(() => {
    if (!query || query.trim() === "") {
      setResults({ posts: [], users: [] });
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchPostsAndUsers(query);
        setResults(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Global shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const flatItems = [
    ...results.posts.map(p => ({ type: "post" as const, id: p.id, title: p.title, url: `/blog/${p.slug}/${p.id}` })),
    ...results.users.map(u => ({ type: "user" as const, id: u.id, name: u.name, url: `/user/${encodeURIComponent(u.name)}` }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const selectedItem = flatItems[focusedIndex];
      router.push(selectedItem.url);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-[280px] md:max-w-[320px] z-50">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-9 pl-9 pr-12 text-xs border border-border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:border-foreground/40 transition-colors focus:outline-none placeholder:text-muted-foreground/60 font-sans"
        />
        <div className="absolute right-3 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground border border-border bg-muted/40 pointer-events-none uppercase tracking-widest rounded-sm">
          <span>Ctrl</span>
          <span>K</span>
        </div>
        {isLoading && (
          <Loader2 className="absolute right-12 w-3.5 h-3.5 text-muted-foreground animate-spin" />
        )}
      </form>

      {/* Search dropdown results */}
      {isOpen && (query.trim() !== "") && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1.5 border border-border bg-background shadow-2xl p-2 max-h-[380px] overflow-y-auto z-50 flex flex-col gap-3 rounded-none backdrop-blur-sm"
        >
          {isLoading && flatItems.length === 0 && (
            <div className="py-8 text-center text-xs font-mono text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && flatItems.length === 0 && (
            <div className="py-8 text-center text-xs font-serif italic text-muted-foreground">
              No results found.
            </div>
          )}

          {/* Posts results */}
          {results.posts.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border/40 mb-1">
                Essays
              </div>
              {results.posts.map((post, idx) => {
                const globalIdx = idx;
                const isFocused = globalIdx === focusedIndex;
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}/${post.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block px-2 py-1.5 text-xs text-foreground/90 font-serif leading-snug transition-colors hover:bg-muted ${
                      isFocused ? "bg-muted font-bold" : ""
                    }`}
                  >
                    {post.title}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Users results */}
          {results.users.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border/40 mb-1">
                Authors
              </div>
              {results.users.map((user, idx) => {
                const globalIdx = results.posts.length + idx;
                const isFocused = globalIdx === focusedIndex;
                return (
                  <Link
                    key={user.id}
                    href={`/user/${encodeURIComponent(user.name)}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 text-xs text-foreground/95 transition-colors hover:bg-muted ${
                      isFocused ? "bg-muted font-bold" : ""
                    }`}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 object-cover grayscale" />
                    ) : (
                      <div className="w-5 h-5 bg-muted flex items-center justify-center font-mono text-[9px] text-muted-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-mono">{user.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {flatItems.length > 0 && (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
              className="mt-1 w-full py-2 text-[10px] font-mono uppercase tracking-widest text-center border-t border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              See all results
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
