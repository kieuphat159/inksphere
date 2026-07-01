import { CallService } from './call.service';

describe('CallService', () => {
  it('allows a call when both users belong to the conversation', async () => {
    const prisma = {
      conversationMember: {
        findMany: jest.fn().mockResolvedValue([{ userId: 1 }, { userId: 2 }]),
      },
    };

    const service = new CallService(prisma as any);

    await expect(service.canInitiateCall(101, 1, 2)).resolves.toBe(true);
  });

  it('rejects a call when the target user is not a member', async () => {
    const prisma = {
      conversationMember: {
        findMany: jest.fn().mockResolvedValue([{ userId: 1 }]),
      },
    };

    const service = new CallService(prisma as any);

    await expect(service.canInitiateCall(101, 1, 2)).resolves.toBe(false);
  });
});
