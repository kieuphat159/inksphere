import { fetchMyBookmarks } from "@/lib/actions/bookmarkAction";
import { getSession } from "@/lib/session";
import PostCard from "@/components/postCard";
import Pagination from "@/components/pagination";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const BookmarksPage = async ({ searchParams }: Props) => {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const pageSize = 6;

  const { bookmarks, totalBookmarks } = await fetchMyBookmarks(page, pageSize);
  const totalPages = Math.ceil(totalBookmarks / pageSize);

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
      <div className="border-b border-border/60 pb-6 mb-10">
        <h1 className="font-serif text-3xl font-black text-foreground flex items-center gap-2">
          <Bookmark className="w-7 h-7" /> Saved Essays
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
          Your curated list of bookmarks ({totalBookmarks} items)
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border p-8 bg-muted/5">
          <p className="font-serif italic text-muted-foreground">
            You haven't saved any essays yet.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">
            Click the bookmark icon on any article to save it for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark: any) => (
            <PostCard key={bookmark.id} {...bookmark.post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/user/bookmarks"
          />
        </div>
      )}
    </main>
  );
};

export default BookmarksPage;
