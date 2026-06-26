import { PropsWithChildren } from 'react';  

type Props = PropsWithChildren;

const PostsLayout = ({ children }: Props) => {
  return <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col items-center justify-center flex-grow">{children}</div>;
};

export default PostsLayout;