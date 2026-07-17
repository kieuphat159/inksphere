import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CommentEntity } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => [CommentEntity], { nullable: true })
  comments?: CommentEntity[];
}
