import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { Bookmark } from './entities/bookmark.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Resolver(() => Bookmark)
export class BookmarkResolver {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  bookmarkPost(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number,
  ) {
    const userId = context.req.user.id;
    return this.bookmarkService.bookmarkPost({ userId, postId });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  removeBookmark(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number,
  ) {
    const userId = context.req.user.id;
    return this.bookmarkService.removeBookmark({ userId, postId });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  isBookmarked(
    @Context() context,
    @Args('postId', { type: () => Int }) postId: number,
  ) {
    const userId = context.req.user.id;
    return this.bookmarkService.isBookmarked({ userId, postId });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Bookmark])
  myBookmarks(
    @Context() context,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ) {
    const userId = context.req.user.id;
    return this.bookmarkService.myBookmarks({ userId, skip: skip ?? 0, take: take ?? 10 });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Int)
  myBookmarksCount(@Context() context) {
    const userId = context.req.user.id;
    return this.bookmarkService.myBookmarksCount(userId);
  }
}
