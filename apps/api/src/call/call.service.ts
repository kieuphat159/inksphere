import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(private readonly prisma: PrismaService) {}

  async canInitiateCall(conversationId: number, callerId: number, targetId: number) {
    const members = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: {
          in: [callerId, targetId],
        },
      },
      select: {
        userId: true,
      },
    });

    const memberIds = new Set(members.map((member) => member.userId));
    return memberIds.has(callerId) && memberIds.has(targetId);
  }
}
