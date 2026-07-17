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
import { logCheckpoint } from 'src/common/timing.context';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { RedisService } from 'src/redis/redis.service';

type MessageListOptions = {
  limit?: number;
  cursorId?: number;
};

@Injectable()
export class ChatService {
  private readonly userCacheTtlSeconds = Math.max(
    Math.floor(Number(process.env.CHAT_USER_CACHE_TTL_MS ?? 30000) / 1000),
    1,
  );
  private readonly membershipCacheTtlSeconds = Math.max(
    Math.floor(
      Number(process.env.CHAT_MEMBERSHIP_CACHE_TTL_MS ?? 15000) / 1000,
    ),
    1,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

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
    const __start = Date.now();
    logCheckpoint('chat-service:sendMessage-start');
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

    console.log(
      `[⏱ ChatService.sendMessage] total: ${Date.now() - __start}ms | convId: ${conversationId}`,
    );
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
    const cacheKey = `chat:user:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { id: number } | null;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    await this.redisService.set(
      cacheKey,
      JSON.stringify(user),
      this.userCacheTtlSeconds,
    );

    return user;
  }

  async ensureConversationMember(conversationId: number, userId: number) {
    const cacheKey = `chat:member:${conversationId}:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ConversationMember;
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

    await this.redisService.set(
      cacheKey,
      JSON.stringify(member),
      this.membershipCacheTtlSeconds,
    );
    return member;
  }

  private cacheConversationMember(member: ConversationMember) {
    const cacheKey = `chat:member:${member.conversationId}:${member.userId}`;
    this.redisService.set(
      cacheKey,
      JSON.stringify(member),
      this.membershipCacheTtlSeconds,
    ).catch(() => {});
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
