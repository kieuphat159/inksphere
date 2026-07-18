import { Injectable } from '@nestjs/common';
import { CreateCommentInput } from './dto/create-comment.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constant';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async findOneByPost({
    postId,
    take,
    skip,
  }: {
    postId: number;
    take?: number;
    skip?: number;
  }) {
    return await this.prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take ?? DEFAULT_PAGE_SIZE,
      skip: skip ?? 0,
    });
  }

  async count(postId: number) {
    return await this.prisma.comment.count({
      where: { postId },
    });
  }

  async create(createCommentInput: CreateCommentInput, userId: number) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentInput.content,
        post: {
          connect: {
            id: createCommentInput.postId,
          },
        },
        author: {
          connect: {
            id: userId,
          },
        },
        ...(createCommentInput.parentId && {
          parent: {
            connect: {
              id: createCommentInput.parentId,
            },
          },
        }),
      },
    });

    // Notify post author or parent comment author
    let recipientId: number | null = null;

    if (createCommentInput.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentInput.parentId },
        select: { authorId: true },
      });
      if (parentComment) {
        recipientId = parentComment.authorId;
      }
    } else {
      const post = await this.prisma.post.findUnique({
        where: { id: createCommentInput.postId },
        select: { authorId: true },
      });
      if (post) {
        recipientId = post.authorId;
      }
    }

    if (recipientId && recipientId !== userId) {
      await this.notificationService.create({
        recipientId,
        actorId: userId,
        type: NotificationType.POST_COMMENTED,
        postId: createCommentInput.postId,
        commentId: comment.id,
      });
    }

    return comment;
  }
}
