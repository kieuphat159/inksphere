import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { DEFAULT_PAGE_SIZE } from 'src/constant';
import { take } from 'rxjs';

@Resolver(() => CommentEntity)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) { }

  @Query(() => [CommentEntity])
  getPostComments(@Args("postId", { type: () => Int! }) postId: number,
    @Args("take", {
      type: () => Int,
      nullable: true,
      defaultValue: DEFAULT_PAGE_SIZE
    })
    take: number,
    @Args("skip", {
      type: () => Int,
      nullable: true,
      defaultValue: 0
    })
    skip: number
  ) {
    return this.commentService.findOneByPost({ postId, take, skip });
  }

  @Query(() => Int)
  postCommentsCount(@Args("postId", { type: () => Int!}) postId: number) {
    return this.commentService.count(postId);
  }
}