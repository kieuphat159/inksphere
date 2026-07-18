import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Notification])
  async myNotifications(
    @Context() context,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.findByUser(userId, skip ?? 0, take ?? 20);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Int)
  async unreadNotificationsCount(@Context() context) {
    const userId = context.req.user.id;
    return this.notificationService.countUnread(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markNotificationRead(
    @Context() context,
    @Args('notificationId', { type: () => Int }) notificationId: number,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markAllNotificationsRead(@Context() context) {
    const userId = context.req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }
}
