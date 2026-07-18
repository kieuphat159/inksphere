import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.userService.create(createUserInput);
  }

  @Query(() => User, { nullable: true })
  async getUserByUsername(
    @Args('username', { type: () => String }) username: string,
  ) {
    return await this.userService.findByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async updateUser(
    @Context() context,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    const userId = context.req.user.id;
    return await this.userService.update(userId, updateUserInput);
  }
}
