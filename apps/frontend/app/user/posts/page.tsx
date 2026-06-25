import { fetchUserPosts } from "@/lib/actions/postAction";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import NoPosts from "./_components/noPost";
import PostList from "./_components/postList";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const UserPostsPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { totalPosts, posts } = await fetchUserPosts({
    page: page ? +page : 1,
    pageSize: DEFAULT_PAGE_SIZE
  });
  return <div>
    {(totalPosts > 0 || posts.length > 0) ?
      <PostList posts={posts} currentPage={page ? +page : 1} totalPages={Math.ceil(totalPosts / DEFAULT_PAGE_SIZE)} />
      :
      <NoPosts />}
  </div>;
}

export default UserPostsPage;