import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String, { nullable: true })
  pictureUrl?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  birthdate?: Date | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;
}

@InputType()
export class UpdateUserInput extends CreateUserInput {
  @Field(() => ID)
  id!: string;
}
