import { NotificationService } from './notification.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationType } from './entities/notification.entity';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let prismaMock: any;
  let gatewayMock: any;

  beforeEach(() => {
    prismaMock = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    gatewayMock = {
      sendToUser: jest.fn(),
    };
    notificationService = new NotificationService(prismaMock, gatewayMock);
  });

  describe('create', () => {
    it('should successfully create notification and emit ws event', async () => {
      const input: CreateNotificationInput = {
        recipientId: 1,
        actorId: 2,
        type: NotificationType.POST_LIKED,
        postId: 10,
      };
      const createdNotification = { id: 100, ...input, actor: {}, post: {} };

      prismaMock.notification.create.mockResolvedValue(createdNotification);

      const result = await notificationService.create(input);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          recipientId: input.recipientId,
          actorId: input.actorId,
          type: input.type,
          postId: input.postId,
          commentId: undefined,
        },
        include: {
          actor: { select: { id: true, name: true, avatar: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
      });

      expect(gatewayMock.sendToUser).toHaveBeenCalledWith(
        input.recipientId,
        createdNotification,
      );
      expect(result).toEqual(createdNotification);
    });

    it('should return null and not create notification if actor is recipient', async () => {
      const input: CreateNotificationInput = {
        recipientId: 1,
        actorId: 1, // Self
        type: NotificationType.POST_LIKED,
        postId: 10,
      };

      const result = await notificationService.create(input);

      expect(prismaMock.notification.create).not.toHaveBeenCalled();
      expect(gatewayMock.sendToUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return list of notifications for user sorted desc', async () => {
      const expectedNotifications = [{ id: 1 }, { id: 2 }];
      prismaMock.notification.findMany.mockResolvedValue(expectedNotifications);

      const result = await notificationService.findByUser(1, 0, 5);

      expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
        where: { recipientId: 1 },
        include: {
          actor: { select: { id: true, name: true, avatar: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5,
      });
      expect(result).toEqual(expectedNotifications);
    });
  });

  describe('countUnread', () => {
    it('should return total unread count', async () => {
      prismaMock.notification.count.mockResolvedValue(2);
      const result = await notificationService.countUnread(1);
      expect(prismaMock.notification.count).toHaveBeenCalledWith({
        where: { recipientId: 1, isRead: false },
      });
      expect(result).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should return false if notification not found or does not belong to user', async () => {
      prismaMock.notification.findFirst.mockResolvedValue(null);
      const result = await notificationService.markAsRead(1, 100);
      expect(result).toBe(false);
      expect(prismaMock.notification.update).not.toHaveBeenCalled();
    });

    it('should update and return true if notification exists', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({ id: 100 });
      const result = await notificationService.markAsRead(1, 100);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { isRead: true },
      });
      expect(result).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications to read', async () => {
      const result = await notificationService.markAllAsRead(1);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientId: 1, isRead: false },
        data: { isRead: true },
      });
      expect(result).toBe(true);
    });
  });
});
