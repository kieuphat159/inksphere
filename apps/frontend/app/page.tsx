import Hero from "@/components/hero";
import Post from "@/components/post";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Hero />
      <Post posts={[]} />
    </main>
  );
}
