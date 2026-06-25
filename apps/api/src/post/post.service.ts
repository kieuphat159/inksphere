import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constant';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {

  }

  async findAll({
    skip = 0,
    take = DEFAULT_PAGE_SIZE
  }: {
    skip?: number;
    take?: number
  }) {
    return await this.prisma.post.findMany({
      skip,
      take,
    });
  }

  async count() {
    return await this.prisma.post.count();
  }
  
  async findOne(id: number) {
    return await this.prisma.post.findFirst({
      where: { id },
      include: {
        author: true,
        tags: true,
      }
    });
  }
  
  async findByUser({ userId, skip, take }: { userId: number; skip?: number; take?: number }) {
    return await this.prisma.post.findMany({
      where: { 
        author: {
          id: userId
        }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        published: true,
        slug: true,
        title: true,
        thumbnail: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        }
      },
      take,
      skip,
    });
  }
  async userPostsCount(userId: number) {
    return await this.prisma.post.count({
      where: {
        author: {
          id: userId
        }
      }
    });
  }
}
