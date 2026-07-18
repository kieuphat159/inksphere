import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipStatus as PrismaFriendshipStatus } from '@prisma/client';
import { FriendshipRelationStatus } from './enums/friendship-relation-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendFriendRequest({
    requesterId,
    receiverId,
  }: {
    requesterId: number;
    receiverId: number;
  }) {
    if (requesterId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself',
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.findFriendshipBetween(requesterId, receiverId);
    let friendship;

    if (existing) {
      if (existing.status === PrismaFriendshipStatus.ACCEPTED) {
        throw new BadRequestException('You are already friends');
      }
      if (existing.status === PrismaFriendshipStatus.PENDING) {
        throw new BadRequestException('Friend request already pending');
      }
      if (existing.status === PrismaFriendshipStatus.REJECTED) {
        friendship = await this.prisma.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId,
            receiverId,
            status: PrismaFriendshipStatus.PENDING,
          },
          include: { requester: true, receiver: true },
        });
      }
    } else {
      friendship = await this.prisma.friendship.create({
        data: {
          requesterId,
          receiverId,
          status: PrismaFriendshipStatus.PENDING,
        },
        include: { requester: true, receiver: true },
      });
    }

    // Trigger notification
    if (friendship) {
      await this.notificationService.create({
        recipientId: receiverId,
        actorId: requesterId,
        type: NotificationType.FRIEND_REQUEST_RECEIVED,
      });
    }

    return friendship;
  }

  async acceptFriendRequest({
    userId,
    friendshipId,
  }: {
    userId: number;
    friendshipId: number;
  }) {
    const friendship = await this.getFriendshipOrThrow(friendshipId);

    if (friendship.receiverId !== userId) {
      throw new ForbiddenException('You can only accept requests sent to you');
    }
    if (friendship.status !== PrismaFriendshipStatus.PENDING) {
      throw new BadRequestException('This friend request is no longer pending');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: PrismaFriendshipStatus.ACCEPTED },
      include: { requester: true, receiver: true },
    });

    // Trigger notification
    await this.notificationService.create({
      recipientId: updated.requesterId,
      actorId: userId,
      type: NotificationType.FRIEND_REQUEST_ACCEPTED,
    });

    return updated;
  }

  async rejectFriendRequest({
    userId,
    friendshipId,
  }: {
    userId: number;
    friendshipId: number;
  }) {
    const friendship = await this.getFriendshipOrThrow(friendshipId);

    if (friendship.receiverId !== userId) {
      throw new ForbiddenException('You can only reject requests sent to you');
    }
    if (friendship.status !== PrismaFriendshipStatus.PENDING) {
      throw new BadRequestException('This friend request is no longer pending');
    }

    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: PrismaFriendshipStatus.REJECTED },
    });
    return true;
  }

  async cancelFriendRequest({
    userId,
    friendshipId,
  }: {
    userId: number;
    friendshipId: number;
  }) {
    const friendship = await this.getFriendshipOrThrow(friendshipId);

    if (friendship.requesterId !== userId) {
      throw new ForbiddenException('You can only cancel requests you sent');
    }
    if (friendship.status !== PrismaFriendshipStatus.PENDING) {
      throw new BadRequestException('This friend request is no longer pending');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return true;
  }

  async removeFriend({
    userId,
    friendId,
  }: {
    userId: number;
    friendId: number;
  }) {
    const friendship = await this.findFriendshipBetween(userId, friendId);

    if (!friendship || friendship.status !== PrismaFriendshipStatus.ACCEPTED) {
      throw new BadRequestException('You are not friends with this user');
    }

    await this.prisma.friendship.delete({ where: { id: friendship.id } });
    return true;
  }

  async getIncomingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: PrismaFriendshipStatus.PENDING,
      },
      include: { requester: true, receiver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOutgoingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: PrismaFriendshipStatus.PENDING,
      },
      include: { requester: true, receiver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: PrismaFriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: { requester: true, receiver: true },
      orderBy: { updatedAt: 'desc' },
    });

    return friendships.map((friendship) =>
      friendship.requesterId === userId
        ? friendship.receiver
        : friendship.requester,
    );
  }

  async getFriendshipStatus({
    userId,
    targetUserId,
  }: {
    userId: number;
    targetUserId: number;
  }) {
    if (userId === targetUserId) {
      return { status: FriendshipRelationStatus.NONE, friendshipId: null };
    }

    const friendship = await this.findFriendshipBetween(userId, targetUserId);

    if (!friendship) {
      return { status: FriendshipRelationStatus.NONE, friendshipId: null };
    }

    if (friendship.status === PrismaFriendshipStatus.ACCEPTED) {
      return {
        status: FriendshipRelationStatus.FRIENDS,
        friendshipId: friendship.id,
      };
    }

    if (friendship.status === PrismaFriendshipStatus.PENDING) {
      return {
        status:
          friendship.requesterId === userId
            ? FriendshipRelationStatus.PENDING_SENT
            : FriendshipRelationStatus.PENDING_RECEIVED,
        friendshipId: friendship.id,
      };
    }

    return { status: FriendshipRelationStatus.NONE, friendshipId: null };
  }

  async searchUsers({
    userId,
    query,
    take = 10,
  }: {
    userId: number;
    query: string;
    take?: number;
  }) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { email: { contains: trimmedQuery, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { name: 'asc' },
    });
  }

  private async getFriendshipOrThrow(friendshipId: number) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }
    return friendship;
  }

  private findFriendshipBetween(userId: number, targetUserId: number) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: userId },
        ],
      },
    });
  }
}
