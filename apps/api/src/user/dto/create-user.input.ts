import { F } from '@faker-js/faker/dist/airline-DF6RqYmq';
import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}
