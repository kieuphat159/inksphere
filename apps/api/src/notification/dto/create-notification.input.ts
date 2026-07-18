import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

@InputType()
export class CreateNotificationInput {
  @Field(() => Int)
  @IsNumber()
  recipientId: number;

  @Field(() => Int)
  @IsNumber()
  actorId: number;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  postId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  commentId?: number;
}
