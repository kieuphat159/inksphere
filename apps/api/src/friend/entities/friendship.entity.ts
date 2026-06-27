import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { FriendshipStatus } from '../enums/friendship-status.enum';

@ObjectType()
export class Friendship {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  requester: User;

  @Field(() => User)
  receiver: User;

  @Field(() => FriendshipStatus)
  status: FriendshipStatus;

  @Field()
  createdAt: Date;
}
