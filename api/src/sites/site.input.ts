import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSiteInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  address!: string;

  @Field(() => String)
  postalCode!: string;

  @Field(() => String)
  city!: string;
}

@InputType()
export class UpdateSiteInput extends CreateSiteInput {
  @Field(() => ID)
  id!: string;
}
