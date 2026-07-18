import { fetchFullSearch } from "@/lib/actions/searchAction";
import PostCard from "@/components/postCard";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "@heroicons/react/24/outline";
import Pagination from "@/components/pagination";

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

const SearchPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 8;

  const { posts, totalPosts, users } = await fetchFullSearch({
    query,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
      <div className="border-b border-border/60 pb-6 mb-10">
        <h1 className="font-serif text-3xl font-black text-foreground">
          Search Results
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
          {query ? `Showing results for: "${query}"` : "Enter a search term to find articles and authors"}
        </p>
      </div>

      {query.trim() === "" ? (
        <div className="py-16 text-center text-sm font-serif italic text-muted-foreground">
          Please type a search query in the search bar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main search results (Posts) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 mb-4">
              Essays ({totalPosts})
            </h2>

            {posts.length === 0 ? (
              <div className="py-16 text-center text-sm font-serif italic text-muted-foreground border border-dashed border-border p-8">
                No articles matched your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl={`/search?q=${encodeURIComponent(query)}`}
                />
              </div>
            )}
          </div>

          {/* Sidebar results (Authors) */}
          <div className="flex flex-col gap-6 lg:border-l lg:border-border/40 lg:pl-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 mb-4">
              Authors ({users.length})
            </h2>

            {users.length === 0 ? (
              <div className="py-8 text-center text-xs font-serif italic text-muted-foreground">
                No authors matched your search.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/user/${encodeURIComponent(user.name)}`}
                    className="flex items-center gap-3.5 p-2 border border-border/40 bg-muted/5 hover:bg-muted/15 hover:border-border transition-all"
                  >
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        <UserIcon className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-bold text-foreground truncate">
                        {user.name}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default SearchPage;
