import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Like } from './entities/like.entity';
import { LikeService } from './like.service';

@Resolver(() => Like)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}
  
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async likePost(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number
  ) {
    const userId = context.req.user.id;
    return await this.likeService.likePost({ userId, postId });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async unlikePost(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number
  ) {
    const userId = context.req.user.id;
    return await this.likeService.unlikePost({ userId, postId });
  }

  @Query(() => Int)
  postLikeCount(@Args('postId', { type: () => Int }) postId: number) {
    return this.likeService.getPostLikeCount(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async userLikedPost(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number
  ) {
    const userId = context.req.user.id;
    return await this.likeService.userLikedPost({ userId, postId });
  }
}
