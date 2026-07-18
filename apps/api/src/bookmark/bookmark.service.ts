import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  async bookmarkPost({ userId, postId }: { userId: number; postId: number }) {
    try {
      await this.prisma.bookmark.create({ data: { userId, postId } });
      return true;
    } catch {
      throw new BadRequestException('Already bookmarked or post not found');
    }
  }

  async removeBookmark({ userId, postId }: { userId: number; postId: number }) {
    try {
      await this.prisma.bookmark.delete({
        where: { userId_postId: { userId, postId } },
      });
      return true;
    } catch {
      throw new BadRequestException('Bookmark not found');
    }
  }

  async isBookmarked({ userId, postId }: { userId: number; postId: number }) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!bookmark;
  }

  async myBookmarks({ userId, skip = 0, take = 10 }: { userId: number; skip?: number; take?: number }) {
    return await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async myBookmarksCount(userId: number) {
    return await this.prisma.bookmark.count({ where: { userId } });
  }
}
