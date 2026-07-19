import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constant';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  private async getCacheVersion(): Promise<string> {
    const version = await this.redisService.get('posts:cache_version');
    if (!version) {
      const initialVersion = Date.now().toString();
      await this.redisService.set('posts:cache_version', initialVersion);
      return initialVersion;
    }
    return version;
  }

  private async incrementCacheVersion(): Promise<void> {
    const newVersion = Date.now().toString();
    await this.redisService.set('posts:cache_version', newVersion);
  }

  async findAll({
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
  }: {
    skip?: number;
    take?: number;
  }) {
    const version = await this.getCacheVersion();
    const cacheKey = `posts:feed:${version}:${skip}:${take}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await this.prisma.post.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    await this.redisService.set(cacheKey, JSON.stringify(posts), 300);
    return posts;
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
      },
    });
  }

  async findByUser({
    userId,
    skip,
    take,
  }: {
    userId: number;
    skip?: number;
    take?: number;
  }) {
    return await this.prisma.post.findMany({
      where: {
        author: {
          id: userId,
        },
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
        },
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async userPostsCount(userId: number) {
    return await this.prisma.post.count({
      where: {
        author: {
          id: userId,
        },
      },
    });
  }

  async findByUsername({
    username,
    skip,
    take,
  }: {
    username: string;
    skip?: number;
    take?: number;
  }) {
    return await this.prisma.post.findMany({
      where: {
        author: {
          name: {
            equals: username,
            mode: 'insensitive',
          },
        },
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countByUsername(username: string) {
    return await this.prisma.post.count({
      where: {
        author: {
          name: {
            equals: username,
            mode: 'insensitive',
          },
        },
        published: true,
      },
    });
  }

  async create({
    createPostInput,
    authorId,
  }: {
    createPostInput: CreatePostInput;
    authorId: number;
  }) {
    const { tags, ...rest } = createPostInput;
    const post = await this.prisma.post.create({
      data: {
        ...rest,
        author: {
          connect: {
            id: authorId,
          },
        },
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
    await this.incrementCacheVersion();
    return post;
  }

  async update({
    userId,
    updatePostInput,
  }: {
    userId: number;
    updatePostInput: UpdatePostInput;
  }) {
    console.log(
      'DEBUG: updatePostInput received:',
      JSON.stringify(updatePostInput),
      'userId:',
      userId,
    );
    const authorIdMatch = await this.prisma.post.findFirst({
      where: { id: updatePostInput.postId, authorId: userId },
    });

    if (!authorIdMatch) {
      throw new Error('You are not authorized to update this post.');
    }
    const { postId, ...data } = updatePostInput;
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...data,
        tags: {
          set: [],
          connectOrCreate: updatePostInput.tags!.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
    await this.incrementCacheVersion();
    return updated;
  }

  async deletePost({ userId, postId }: { userId: number; postId: number }) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error('Post not found.');
    }

    if (post.authorId !== userId) {
      throw new Error('You are not the owner of this post.');
    }

    const result = await this.prisma.post.delete({
      where: { id: postId },
    });
    await this.incrementCacheVersion();
    return !!result;
  }

  async searchPosts({
    query,
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
  }: {
    query: string;
    skip?: number;
    take?: number;
  }) {
    return await this.prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        author: true,
        tags: true,
        _count: { select: { comments: true, likes: true } },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchPostsCount(query: string) {
    return await this.prisma.post.count({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async getPostsByTag({
    tagName,
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
  }: {
    tagName: string;
    skip?: number;
    take?: number;
  }) {
    return await this.prisma.post.findMany({
      where: {
        published: true,
        tags: {
          some: {
            name: { equals: tagName, mode: 'insensitive' },
          },
        },
      },
      include: {
        author: true,
        tags: true,
        _count: { select: { comments: true, likes: true } },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPostsByTagCount(tagName: string) {
    return await this.prisma.post.count({
      where: {
        published: true,
        tags: {
          some: {
            name: { equals: tagName, mode: 'insensitive' },
          },
        },
      },
    });
  }
}
