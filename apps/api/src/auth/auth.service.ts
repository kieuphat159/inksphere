import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInInput } from './dto/signin.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth.jwtPayload';
import { User } from '.prisma/client/default';
import { CreateUserInput } from 'src/user/dto/create-user.input';

@Injectable()
export class AuthService {
  private readonly jwtUserCache = new Map<
    number,
    { expiresAt: number; value: { id: number } }
  >();
  private readonly jwtUserCacheTtlMs = Math.max(
    Number(process.env.AUTH_USER_CACHE_TTL_MS ?? 30000),
    1000,
  );

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async validateLocalUser({ email, password }: SignInInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatched = await verify(user.password, password);
    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async login(user: User) {
    const { accessToken } = await this.generateToken(user.id);
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken,
    };
  }

  async validateJwtUser(userId: number) {
    const cachedUser = this.jwtUserCache.get(userId);
    if (cachedUser && cachedUser.expiresAt > Date.now()) {
      return cachedUser.value;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser = { id: user.id };
    this.jwtUserCache.set(userId, {
      value: currentUser,
      expiresAt: Date.now() + this.jwtUserCacheTtlMs,
    });
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (user) {
      const { password, ...authUser } = user;
      return authUser;
    }

    const dbUser = await this.prisma.user.create({
      data: {
        ...googleUser,
      },
    });

    const { password, ...authUser } = dbUser;
    return authUser;
  }
}
