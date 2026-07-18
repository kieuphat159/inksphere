import { fetchPostsByTag } from "@/lib/actions/postAction";
import PostCard from "@/components/postCard";
import Pagination from "@/components/pagination";

type Props = {
  params: Promise<{
    tag: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const TagPage = async ({ params, searchParams }: Props) => {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const pageSize = 8;

  const { posts, totalPosts } = await fetchPostsByTag({
    tagName: tag,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
      <div className="border-b border-border/60 pb-6 mb-10">
        <h1 className="font-serif text-3xl font-black text-foreground">
          Tag: #{tag}
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
          Showing all essays categorized under #{tag}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-16 text-center text-sm font-serif italic text-muted-foreground border border-dashed border-border p-8">
          No articles found under this tag.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/tags/${encodeURIComponent(tag)}`}
          />
        </div>
      )}
    </main>
  );
};

export default TagPage;
