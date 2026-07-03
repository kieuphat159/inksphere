import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MessageType,
  ConversationType,
  ConversationMemberRole,
  ConversationMember,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';

type MessageListOptions = {
  limit?: number;
  cursorId?: number;
};

@Injectable()
export class ChatService {
  private readonly userCache = new Map<
    number,
    { expiresAt: number; value: { id: number } | null }
  >();
  private readonly memberCache = new Map<
    string,
    { expiresAt: number; value: ConversationMember }
  >();
  private readonly userCacheTtlMs = Math.max(
    Number(process.env.CHAT_USER_CACHE_TTL_MS ?? 30000),
    1000,
  );
  private readonly membershipCacheTtlMs = Math.max(
    Number(process.env.CHAT_MEMBERSHIP_CACHE_TTL_MS ?? 15000),
    1000,
  );

  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        lastMessage: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async getMessages(
    userId: number,
    conversationId: number,
    options: MessageListOptions = {},
  ) {
    await this.ensureConversationMember(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: Math.min(Math.max(options.limit ?? 50, 1), 100),
      ...(options.cursorId
        ? {
            cursor: {
              id: options.cursorId,
            },
            skip: 1,
          }
        : {}),
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return messages.reverse();
  }

  async createDirectConversation(userId: number, participantId: number) {
    if (userId === participantId) {
      throw new BadRequestException(
        'Cannot create a direct conversation with yourself',
      );
    }

    const participants = await this.prisma.user.findMany({
      where: {
        id: {
          in: [userId, participantId],
        },
      },
      select: {
        id: true,
      },
    });

    if (participants.length !== 2) {
      throw new NotFoundException('Participant not found');
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
          {
            members: {
              some: {
                userId: participantId,
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    });

    if (existing && existing.members.length === 2) {
      return existing;
    }

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        members: {
          create: [
            {
              userId,
              role: ConversationMemberRole.OWNER,
            },
            {
              userId: participantId,
              role: ConversationMemberRole.MEMBER,
            },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async createGroupConversation(
    userId: number,
    dto: CreateGroupConversationDto,
  ) {
    const memberIds = Array.from(new Set([userId, ...dto.memberIds]));

    if (memberIds.length < 2) {
      throw new BadRequestException(
        'A group conversation needs at least two members',
      );
    }

    const foundUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: memberIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundUsers.length !== memberIds.length) {
      throw new NotFoundException('One or more members were not found');
    }

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.GROUP,
        title: dto.title,
        createdById: userId,
        members: {
          create: memberIds.map((memberId) => ({
            userId: memberId,
            role:
              memberId === userId
                ? ConversationMemberRole.OWNER
                : ConversationMemberRole.MEMBER,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async sendMessage(
    userId: number,
    conversationId: number,
    data: {
      content?: string;
      type?: MessageType;
      attachmentUrl?: string;
      metadata?: any;
    },
    member?: ConversationMember,
  ) {
    const conversationMember =
      member ?? (await this.ensureConversationMember(conversationId, userId));
    this.validateMessagePayload(data);
    const lastReadAt = new Date();

    const message = await this.prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: data.type ?? MessageType.TEXT,
          content: data.content?.trim() || null,
          attachmentUrl: data.attachmentUrl ?? null,
          metadata: data.metadata,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      await tx.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          lastMessageId: createdMessage.id,
        },
      });

      await tx.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        data: {
          lastReadAt,
        },
      });

      return createdMessage;
    });

    this.cacheConversationMember({
      ...conversationMember,
      lastReadAt,
    });

    return {
      message,
      conversationId,
      senderMemberRole: conversationMember.role,
    };
  }

  async markConversationRead(
    userId: number,
    conversationId: number,
    readAt?: string | Date,
  ) {
    await this.ensureConversationMember(conversationId, userId);

    const member = await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastReadAt: readAt ? new Date(readAt) : new Date(),
      },
    });

    this.cacheConversationMember(member);
    return member;
  }

  async getConversationMembers(conversationId: number) {
    return this.prisma.conversationMember.findMany({
      where: {
        conversationId,
      },
      select: {
        userId: true,
      },
    });
  }

  async findUserById(userId: number) {
    const cachedUser = this.userCache.get(userId);
    if (cachedUser && cachedUser.expiresAt > Date.now()) {
      return cachedUser.value;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    this.userCache.set(userId, {
      value: user,
      expiresAt: Date.now() + this.userCacheTtlMs,
    });

    return user;
  }

  async ensureConversationMember(conversationId: number, userId: number) {
    const cacheKey = this.memberCacheKey(conversationId, userId);
    const cachedMember = this.memberCache.get(cacheKey);
    if (cachedMember && cachedMember.expiresAt > Date.now()) {
      return cachedMember.value;
    }

    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    this.cacheConversationMember(member);
    return member;
  }

  private cacheConversationMember(member: ConversationMember) {
    this.memberCache.set(
      this.memberCacheKey(member.conversationId, member.userId),
      {
        value: member,
        expiresAt: Date.now() + this.membershipCacheTtlMs,
      },
    );
  }

  private memberCacheKey(conversationId: number, userId: number) {
    return `${conversationId}:${userId}`;
  }

  private validateMessagePayload(data: {
    content?: string;
    type?: MessageType;
    attachmentUrl?: string;
  }) {
    const hasContent = !!data.content?.trim();
    const hasAttachment = !!data.attachmentUrl?.trim();

    if (!hasContent && !hasAttachment) {
      throw new BadRequestException(
        'Message content or attachmentUrl is required',
      );
    }

    if (data.type === MessageType.TEXT && !hasContent) {
      throw new BadRequestException('Text messages require content');
    }
  }
}
