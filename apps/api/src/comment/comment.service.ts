import { Injectable } from '@nestjs/common';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constant';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
    async findOneByPost({ postId, take, skip }: { postId: number; take?: number; skip?: number; }) {
      return await this.prisma.comment.findMany({
        where: { postId },
        include: {
          author: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: take ?? DEFAULT_PAGE_SIZE,
        skip: skip ?? 0,
      });
    }

    async count(postId: number) {
      return await this.prisma.comment.count({
        where: { postId }
      });
    }

    async create(createCommentInput: CreateCommentInput, userId: number) {
      return await this.prisma.comment.create({
        data: {
          content: createCommentInput.content,
          post: {
            connect: {
              id: createCommentInput.postId
            }
          },
          author: {
            connect: {
              id: userId
            }
          }
        }
      });
  }  
}
