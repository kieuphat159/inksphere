import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constant';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

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

  async create({ createPostInput, authorId }: { createPostInput: CreatePostInput; authorId: number }) {
    const { tags, ...rest } = createPostInput;
    return await this.prisma.post.create({
      data: {
        ...rest,
        author: {
          connect: {
            id: authorId
          }
        },
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
  }
  
  async update({ userId, updatePostInput }: { userId: number; updatePostInput: UpdatePostInput }) {
    const authorIdMatch = await this.prisma.post.findUnique({
      where: { id: updatePostInput.postId, authorId: userId },
    });

    if (!authorIdMatch) {
      throw new Error("You are not authorized to update this post.");
    }
    const { postId, ...data } = updatePostInput;
    return await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...data,
        tags: {
          set: [],
          connectOrCreate: updatePostInput.tags!.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
  }
}
