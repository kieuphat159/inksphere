import Hero from "@/components/hero";
import Post from "@/components/posts";
import { fetchPosts } from "@/lib/types/actions/postAction";
import Image from "next/image";

export default async function Home() {
  const posts = await fetchPosts();
  return (
    <main>
      <Hero />
      <Post posts={posts} />
    </main>
  );
}
