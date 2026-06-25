import { PropsWithChildren } from 'react';  

type Props = PropsWithChildren;

const PostsLayout = ({ children }: Props) => {
  return <div className="mt-24">{children}</div>;
};

export default PostsLayout;