import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { Prisma } from '.prisma/client/default';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    const { password, ...user } = createUserInput;
    const hashedPassword = await hash(password);

    try {
      return await this.prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findFirst({
      where: {
        name: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const { id: _, password, ...data } = updateUserInput;
    const updateData: any = { ...data };
    if (password) {
      updateData.password = await hash(password);
    }
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
