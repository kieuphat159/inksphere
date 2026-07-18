import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => Int)
  @IsNumber()
  postId!: number;

  @Field()
  @IsString()
  content!: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}
