import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FriendshipRelationStatus } from '../enums/friendship-relation-status.enum';

@ObjectType()
export class FriendshipRelation {
  @Field(() => FriendshipRelationStatus)
  status: FriendshipRelationStatus;

  @Field(() => Int, { nullable: true })
  friendshipId?: number;
}
