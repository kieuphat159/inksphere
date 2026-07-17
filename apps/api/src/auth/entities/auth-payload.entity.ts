import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  accessToken: string;
}
