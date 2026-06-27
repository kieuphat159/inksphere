import { registerEnumType } from '@nestjs/graphql';

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

registerEnumType(FriendshipStatus, {
  name: 'FriendshipStatus',
});
