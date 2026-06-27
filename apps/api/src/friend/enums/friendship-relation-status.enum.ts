import { registerEnumType } from '@nestjs/graphql';

export enum FriendshipRelationStatus {
  NONE = 'NONE',
  PENDING_SENT = 'PENDING_SENT',
  PENDING_RECEIVED = 'PENDING_RECEIVED',
  FRIENDS = 'FRIENDS',
}

registerEnumType(FriendshipRelationStatus, {
  name: 'FriendshipRelationStatus',
});
