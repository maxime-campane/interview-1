import { randomUUID } from 'node:crypto';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { INITIAL_SITES } from './fixtures/sites';
import { CreateUserInput, UpdateUserInput } from './users/user.input';
import { User } from './users/user.model';
import { UserStoreService } from './users/user-store.service';
import { CreateSiteInput, UpdateSiteInput } from './sites/site.input';
import { Site } from './sites/site.model';

@Resolver()
export class ManagementResolver {
  private readonly siteRecords: Site[] = structuredClone(INITIAL_SITES);

  constructor(private readonly userStore: UserStoreService) {}

  @Query(() => [User])
  users(): User[] {
    return this.userStore.getAll().filter((user) => user.deletedAt === null);
  }

  @Mutation(() => User)
  createUser(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput,
  ): Promise<User> {
    return this.userStore.create(input);
  }

  @Mutation(() => User)
  updateUser(
    @Args('input', { type: () => UpdateUserInput }) input: UpdateUserInput,
  ): User {
    return this.userStore.update(input.id, input);
  }

  @Mutation(() => Boolean)
  deleteUser(@Args('id', { type: () => ID }) id: string): boolean {
    return this.userStore.delete(id);
  }

  @Query(() => [Site])
  sites(): Site[] {
    return this.siteRecords;
  }

  @Mutation(() => Site)
  createSite(
    @Args('input', { type: () => CreateSiteInput }) input: CreateSiteInput,
  ): Site {
    const site: Site = {
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
    };

    this.siteRecords.unshift(site);

    return site;
  }

  @Mutation(() => Site)
  updateSite(
    @Args('input', { type: () => UpdateSiteInput }) input: UpdateSiteInput,
  ): Site {
    const site = this.siteRecords.find((record) => record.id === input.id);

    if (!site) {
      throw new GraphQLError('Site introuvable.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    site.name = input.name;
    site.address = input.address;
    site.postalCode = input.postalCode;
    site.city = input.city;

    return site;
  }

  @Mutation(() => Boolean)
  deleteSite(@Args('id', { type: () => ID }) id: string): boolean {
    const index = this.siteRecords.findIndex((site) => site.id === id);

    if (index === -1) {
      throw new GraphQLError('Site introuvable.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    this.siteRecords.splice(index, 1);

    return true;
  }
}
