import { BookmarkService } from './bookmark.service';
import { BadRequestException } from '@nestjs/common';

describe('BookmarkService', () => {
  let bookmarkService: BookmarkService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      bookmark: {
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    bookmarkService = new BookmarkService(prismaMock as any);
  });

  describe('bookmarkPost', () => {
    it('should successfully create bookmark and return true', async () => {
      prismaMock.bookmark.create.mockResolvedValue({ id: 1 });
      const result = await bookmarkService.bookmarkPost({ userId: 1, postId: 2 });
      expect(prismaMock.bookmark.create).toHaveBeenCalledWith({
        data: { userId: 1, postId: 2 },
      });
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if creation fails', async () => {
      prismaMock.bookmark.create.mockRejectedValue(new Error('DB Error'));
      await expect(
        bookmarkService.bookmarkPost({ userId: 1, postId: 2 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeBookmark', () => {
    it('should successfully delete bookmark and return true', async () => {
      prismaMock.bookmark.delete.mockResolvedValue({ id: 1 });
      const result = await bookmarkService.removeBookmark({ userId: 1, postId: 2 });
      expect(prismaMock.bookmark.delete).toHaveBeenCalledWith({
        where: { userId_postId: { userId: 1, postId: 2 } },
      });
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if deletion fails', async () => {
      prismaMock.bookmark.delete.mockRejectedValue(new Error('DB Error'));
      await expect(
        bookmarkService.removeBookmark({ userId: 1, postId: 2 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isBookmarked', () => {
    it('should return true if bookmark exists', async () => {
      prismaMock.bookmark.findUnique.mockResolvedValue({ id: 1 });
      const result = await bookmarkService.isBookmarked({ userId: 1, postId: 2 });
      expect(prismaMock.bookmark.findUnique).toHaveBeenCalledWith({
        where: { userId_postId: { userId: 1, postId: 2 } },
      });
      expect(result).toBe(true);
    });

    it('should return false if bookmark does not exist', async () => {
      prismaMock.bookmark.findUnique.mockResolvedValue(null);
      const result = await bookmarkService.isBookmarked({ userId: 1, postId: 2 });
      expect(result).toBe(false);
    });
  });

  describe('myBookmarks', () => {
    it('should query bookmarks with pagination and relation details', async () => {
      const expectedBookmarks = [{ id: 1, post: {} }];
      prismaMock.bookmark.findMany.mockResolvedValue(expectedBookmarks);

      const result = await bookmarkService.myBookmarks({ userId: 1, skip: 0, take: 5 });

      expect(prismaMock.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              _count: { select: { comments: true, likes: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5,
      });
      expect(result).toEqual(expectedBookmarks);
    });
  });

  describe('myBookmarksCount', () => {
    it('should return count of bookmarks for user', async () => {
      prismaMock.bookmark.count.mockResolvedValue(3);
      const result = await bookmarkService.myBookmarksCount(1);
      expect(prismaMock.bookmark.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toBe(3);
    });
  });
});
