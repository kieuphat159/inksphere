import { notFound } from "next/navigation";
import { fetchUserByUsername, fetchUserPostsByUsername } from "@/lib/actions/profileAction";
import { getSession } from "@/lib/session";
import ProfileHeader from "./_components/profileHeader";
import ProfilePosts from "./_components/profilePosts";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { page } = await searchParams;
  const decodedUsername = decodeURIComponent(username);

  const [user, { posts, totalPosts }] = await Promise.all([
    fetchUserByUsername(decodedUsername),
    fetchUserPostsByUsername({
      username: decodedUsername,
      page: page ? +page : undefined,
    }),
  ]);

  if (!user) {
    notFound();
  }

  const session = await getSession();
  const isOwnProfile = session?.user?.id === String(user.id);

  return (
    <main className="pb-16">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        currentUser={session?.user}
      />
      <ProfilePosts
        posts={posts}
        user={user}
        currentPage={page ? +page : 1}
        totalPages={Math.ceil(totalPosts / DEFAULT_PAGE_SIZE)}
        currentUser={session?.user}
        isOwnProfile={isOwnProfile}
      />
    </main>
  );
}
