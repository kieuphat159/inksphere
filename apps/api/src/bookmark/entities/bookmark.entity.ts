import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';

@ObjectType()
export class Bookmark {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  postId: number;

  @Field()
  createdAt: Date;

  @Field(() => Post, { nullable: true })
  post?: Post;
}
