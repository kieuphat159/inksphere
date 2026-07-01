import Post from "@/components/posts";
import { fetchPosts } from "@/lib/actions/postAction";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getSession } from "@/lib/session";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;
  const { totalPosts, posts } = await fetchPosts({ page: page ? +page : undefined });
  const session = await getSession();

  return (
    <main className="pb-16">
      <section className="border-b border-border/70 bg-background/70">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-12 md:py-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            PERSONAL BLOG
          </span>
          <h1 className="font-serif text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Stories, notes, and thoughtful reflections.
          </h1>
          <p className="max-w-2xl font-serif text-base leading-relaxed text-muted-foreground md:text-lg">
            A calm space for essays, observations, and the kind of writing that feels worth returning to.
          </p>
        </div>
      </section>
      <Post
        posts={posts}
        currentPage={page ? +page : 1}
        totalPages={Math.ceil(totalPosts / DEFAULT_PAGE_SIZE)}
        currentUser={session?.user}
      />
    </main>
  );
}
