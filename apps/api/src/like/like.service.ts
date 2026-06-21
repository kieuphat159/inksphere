import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLikeInput } from './dto/create-like.input';
import { UpdateLikeInput } from './dto/update-like.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likePost({ postId, userId }: {  postId: number; userId: any }) {
    try {
      return !!(await this.prisma.like.create({
        data: {
          postId,
          userId,
        },
      }));
    } catch (error) {
      throw new BadRequestException('Failed to like the post');
    }
  }

  async unlikePost({ userId, postId }: { userId: any; postId: number }) {
    try {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return true;
    } catch (error) {
      throw new BadRequestException('Failed to unlike the post');
    }
  }

  async getPostLikeCount(postId: number) {
    return await this.prisma.like.count({
      where: {
        postId,
      },
    });
  }

  async userLikedPost({ userId, postId }: { userId: number; postId: number }) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return !!like;
  }
}
  