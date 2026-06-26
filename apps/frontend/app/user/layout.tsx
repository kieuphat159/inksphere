import { PropsWithChildren } from 'react';  

type Props = PropsWithChildren;

const PostsLayout = ({ children }: Props) => {
  return <div className="mt-24 flex flex-col items-center justify-center">{children}</div>;
};

export default PostsLayout;