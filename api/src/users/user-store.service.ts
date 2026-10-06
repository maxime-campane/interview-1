import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { GraphQLError } from "graphql";

import { INITIAL_USERS } from "../fixtures/users";
import { User } from "./user.model";
import { FakeEmailService } from "../emails/fake-email.service";

type UserFields = Pick<
  User,
  "firstName" | "lastName" | "email" | "birthdate" | "phone"
> & {
  pictureUrl: string | null;
};
type NewUserFields = Pick<UserFields, "firstName" | "lastName" | "email"> &
  Partial<Pick<UserFields, "birthdate" | "phone" | "pictureUrl">>;

@Injectable()
export class UserStoreService {
  constructor(private readonly emailService: FakeEmailService) {}
  private readonly records: User[] = structuredClone(INITIAL_USERS);

  // Inclut les utilisateurs supprimés logiquement.
  getAll(): readonly User[] {
    return this.records;
  }

  async create(fields: NewUserFields): Promise<User> {
    if (this.records.some((user) => user.email === fields.email)) {
      throw new GraphQLError("Cet email est déjà utilisé.", {
        extensions: { code: "CONFLICT" },
      });
    }

    const user: User = {
      id: randomUUID(),
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      pictureUrl: fields.pictureUrl ?? "",
      birthdate: fields.birthdate ?? null,
      phone: fields.phone ?? null,
      createdAt: new Date(),
      deletedAt: null,
    };

    this.records.unshift(user);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Bienvenue sur Wobee",
      body: "Bienvenue sur Wobee",
    });

    return user;
  }

  update(id: string, fields: Partial<UserFields>): User {
    const user = this.records.find(
      (record) => record.id === id && record.deletedAt === null,
    );

    if (!user) {
      throw new GraphQLError("Utilisateur introuvable.", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    if (
      fields.email !== undefined &&
      this.records.some(
        (record) => record.id !== id && record.email === fields.email,
      )
    ) {
      throw new GraphQLError("Cet email est déjà utilisé.", {
        extensions: { code: "CONFLICT" },
      });
    }

    if (fields.firstName !== undefined) {
      user.firstName = fields.firstName;
    }

    if (fields.lastName !== undefined) {
      user.lastName = fields.lastName;
    }

    if (fields.email !== undefined) {
      user.email = fields.email;
    }

    if (fields.birthdate !== undefined) {
      user.birthdate = fields.birthdate;
    }

    if (fields.phone !== undefined) {
      user.phone = fields.phone;
    }

    if (fields.pictureUrl !== undefined) {
      user.pictureUrl = fields.pictureUrl ?? "";
    }

    return user;
  }

  delete(id: string): boolean {
    const user = this.records.find(
      (record) => record.id === id && record.deletedAt === null,
    );

    if (!user) {
      throw new GraphQLError("Utilisateur introuvable.", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    user.deletedAt = new Date();

    return true;
  }
}
