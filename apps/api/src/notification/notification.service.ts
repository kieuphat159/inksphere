import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(input: CreateNotificationInput) {
    // Avoid self-notification
    if (input.actorId === input.recipientId) return null;

    const notification = await this.prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        type: input.type,
        postId: input.postId,
        commentId: input.commentId,
      },
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
        post: { select: { id: true, title: true, slug: true } },
      },
    });

    // Emit real-time notification to recipient
    this.notificationGateway.sendToUser(input.recipientId, notification);

    return notification;
  }

  async findByUser(userId: number, skip = 0, take = 20) {
    return await this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
        post: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countUnread(userId: number) {
    return await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, recipientId: userId },
    });
    if (!notification) return false;

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return true;
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  }
}
