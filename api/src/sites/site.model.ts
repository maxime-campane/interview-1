import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Site {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  address!: string;

  @Field(() => String)
  postalCode!: string;

  @Field(() => String)
  city!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
