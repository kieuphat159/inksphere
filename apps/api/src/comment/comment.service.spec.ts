import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { NotificationType } from 'src/notification/entities/notification.entity';

describe('CommentService', () => {
  let commentService: CommentService;
  let prismaMock: any;
  let notificationServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      comment: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
      },
    };

    notificationServiceMock = {
      create: jest.fn(),
    };

    commentService = new CommentService(prismaMock as any, notificationServiceMock as any);
  });

  describe('findOneByPost', () => {
    it('should query comments with null parentId and include replies', async () => {
      const postId = 1;
      const skip = 0;
      const take = 10;
      const expectedComments = [
        { id: 1, content: 'Comment 1', replies: [] },
      ];

      prismaMock.comment.findMany.mockResolvedValue(expectedComments);

      const result = await commentService.findOneByPost({ postId, skip, take });

      expect(prismaMock.comment.findMany).toHaveBeenCalledWith({
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
        take,
        skip,
      });
      expect(result).toEqual(expectedComments);
    });
  });

  describe('count', () => {
    it('should return total count of comments for a post', async () => {
      const postId = 1;
      prismaMock.comment.count.mockResolvedValue(5);

      const result = await commentService.count(postId);

      expect(prismaMock.comment.count).toHaveBeenCalledWith({
        where: { postId },
      });
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should create a direct comment and send notification to post author', async () => {
      const userId = 10;
      const postAuthorId = 20;
      const input: CreateCommentInput = {
        postId: 1,
        content: 'Nice post!',
      };
      const createdComment = { id: 100, content: 'Nice post!', authorId: userId, postId: 1 };

      prismaMock.comment.create.mockResolvedValue(createdComment);
      prismaMock.post.findUnique.mockResolvedValue({ authorId: postAuthorId });

      const result = await commentService.create(input, userId);

      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: {
          content: input.content,
          post: { connect: { id: input.postId } },
          author: { connect: { id: userId } },
        },
      });

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: input.postId },
        select: { authorId: true },
      });

      expect(notificationServiceMock.create).toHaveBeenCalledWith({
        recipientId: postAuthorId,
        actorId: userId,
        type: NotificationType.POST_COMMENTED,
        postId: input.postId,
        commentId: createdComment.id,
      });

      expect(result).toEqual(createdComment);
    });

    it('should create a reply comment and send notification to parent comment author', async () => {
      const userId = 10;
      const parentCommentAuthorId = 30;
      const input: CreateCommentInput = {
        postId: 1,
        content: 'Thank you!',
        parentId: 50,
      };
      const createdComment = { id: 101, content: 'Thank you!', authorId: userId, postId: 1, parentId: 50 };

      prismaMock.comment.create.mockResolvedValue(createdComment);
      prismaMock.comment.findUnique.mockResolvedValue({ authorId: parentCommentAuthorId });

      const result = await commentService.create(input, userId);

      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: {
          content: input.content,
          post: { connect: { id: input.postId } },
          author: { connect: { id: userId } },
          parent: { connect: { id: input.parentId } },
        },
      });

      expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: input.parentId },
        select: { authorId: true },
      });

      expect(notificationServiceMock.create).toHaveBeenCalledWith({
        recipientId: parentCommentAuthorId,
        actorId: userId,
        type: NotificationType.POST_COMMENTED,
        postId: input.postId,
        commentId: createdComment.id,
      });

      expect(result).toEqual(createdComment);
    });

    it('should not send notification if the actor is the recipient', async () => {
      const userId = 10;
      const input: CreateCommentInput = {
        postId: 1,
        content: 'Self comment',
      };
      const createdComment = { id: 102, content: 'Self comment', authorId: userId, postId: 1 };

      prismaMock.comment.create.mockResolvedValue(createdComment);
      prismaMock.post.findUnique.mockResolvedValue({ authorId: userId }); // Self comment

      const result = await commentService.create(input, userId);

      expect(notificationServiceMock.create).not.toHaveBeenCalled();
      expect(result).toEqual(createdComment);
    });
  });
});
