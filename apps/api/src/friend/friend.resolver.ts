import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { Friendship } from './entities/friendship.entity';
import { FriendshipRelation } from './entities/friendship-relation.entity';
import { FriendService } from './friend.service';

@Resolver(() => Friendship)
export class FriendResolver {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Friendship])
  incomingFriendRequests(@Context() context) {
    return this.friendService.getIncomingRequests(context.req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Friendship])
  outgoingFriendRequests(@Context() context) {
    return this.friendService.getOutgoingRequests(context.req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  friends(@Context() context) {
    return this.friendService.getFriends(context.req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => FriendshipRelation)
  friendshipStatus(
    @Context() context,
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    return this.friendService.getFriendshipStatus({
      userId: context.req.user.id,
      targetUserId: userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  searchUsers(
    @Context() context,
    @Args('query') query: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.friendService.searchUsers({
      userId: context.req.user.id,
      query,
      take,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Friendship)
  sendFriendRequest(
    @Context() context,
    @Args('receiverId', { type: () => Int }) receiverId: number,
  ) {
    return this.friendService.sendFriendRequest({
      requesterId: context.req.user.id,
      receiverId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Friendship)
  acceptFriendRequest(
    @Context() context,
    @Args('friendshipId', { type: () => Int }) friendshipId: number,
  ) {
    return this.friendService.acceptFriendRequest({
      userId: context.req.user.id,
      friendshipId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  rejectFriendRequest(
    @Context() context,
    @Args('friendshipId', { type: () => Int }) friendshipId: number,
  ) {
    return this.friendService.rejectFriendRequest({
      userId: context.req.user.id,
      friendshipId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  cancelFriendRequest(
    @Context() context,
    @Args('friendshipId', { type: () => Int }) friendshipId: number,
  ) {
    return this.friendService.cancelFriendRequest({
      userId: context.req.user.id,
      friendshipId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  removeFriend(
    @Context() context,
    @Args('friendId', { type: () => Int }) friendId: number,
  ) {
    return this.friendService.removeFriend({
      userId: context.req.user.id,
      friendId,
    });
  }
}
