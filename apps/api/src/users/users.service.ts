import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { and, eq, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { users } from "@/drizzle/schema/users";
import { Inject, Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";

import {
  CreateGoogleUserDtoType,
  CreateUserDtoType,
  DeleteUserDtoType,
  FindByEmailDtoType,
  FindByGoogleEmailDtoType,
  FindByIdDtoType,
  FindByUsernameDtoType,
  UpdateUserDtoType,
} from "./users.dto";

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
  ) {}
  async create(createUserDto: CreateUserDtoType) {
    const { email, password, username, emailVerifiedAt } = createUserDto;

    // check if a user with the same email or username already exists
    const [existingUserWithSameEmailOrUsername] = await this.db
      .select({ email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUserWithSameEmailOrUsername) {
      if (existingUserWithSameEmailOrUsername.email === email) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already used",
        });
      } else {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This username already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const [userCreated] = await this.db
      .insert(users)
      .values({
        username,
        email,
        hashedPassword,
        authMethod: "email",
        emailVerifiedAt,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });

    return userCreated;
  }

  async createGoogleUser(createGoogleUser: CreateGoogleUserDtoType) {
    const { googleEmail, googleId, username, profilePicture, email } =
      createGoogleUser;

    // check if a user with the email already exists
    const [existingUserWithSameGoogleEmailOrUsername] = await this.db
      .select({
        googleEmail: users.googleEmail,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(
        or(
          and(eq(users.googleEmail, googleEmail), eq(users.googleId, googleId)),
          and(eq(users.email, email), eq(users.googleId, googleId)),
          eq(users.username, username),
        ),
      )
      .limit(1);

    if (existingUserWithSameGoogleEmailOrUsername) {
      if (
        existingUserWithSameGoogleEmailOrUsername.googleEmail === googleEmail
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This google email is already used",
        });
      }

      if (existingUserWithSameGoogleEmailOrUsername.email === email) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already used",
        });
      }

      if (existingUserWithSameGoogleEmailOrUsername.username === username) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This username is already used",
        });
      }
    }

    const randomPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, this.saltRounds);

    const [userCreated] = await this.db
      .insert(users)
      .values({
        username,
        email: googleEmail,
        hashedPassword,
        profilePicture,
        googleId,
        googleEmail,
        authMethod: "google",
        emailVerifiedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });

    return userCreated;
  }

  async findById(findByIdDto: FindByIdDtoType): Promise<
    | {
        email: string;
        username: string;
        id: string;
        profilePicture: string;
        authMethod: "both";
        googleEmail: string;
        registrationDate: Date;
      }
    | {
        email: string;
        username: string;
        id: string;
        profilePicture: string | null;
        authMethod: "email" | "google";
        registrationDate: Date;
      }
    | null
  > {
    const { id } = findByIdDto;

    const [user] = await this.db
      .select({
        email: users.email,
        username: users.username,
        id: users.id,
        profilePicture: users.profilePicture,
        authMethod: users.authMethod,
        googleEmail: users.googleEmail,
        registrationDate: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    if (user.authMethod === "both") {
      return user as {
        email: string;
        username: string;
        id: string;
        profilePicture: string;
        authMethod: "both";
        googleEmail: string;
        registrationDate: Date;
      };
    }

    const { googleEmail, ...remaining } = user;
    return remaining as {
      email: string;
      username: string;
      id: string;
      profilePicture: string | null;
      registrationDate: Date;
      authMethod: "email" | "google";
    };
  }

  async findByEmail(findByEmailDto: FindByEmailDtoType) {
    const { email } = findByEmailDto;

    const [user] = await this.db
      .select({
        email: users.email,
        username: users.username,
        id: users.id,
        profilePicture: users.profilePicture,
        hashedPassword: users.hashedPassword,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByUsername(findByUsernameDto: FindByUsernameDtoType) {
    const { username } = findByUsernameDto;

    const [user] = await this.db
      .select({
        email: users.email,
        username: users.username,
        id: users.id,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByGoogleEmail(findByGoogleEmailDto: FindByGoogleEmailDtoType) {
    const { googleEmail } = findByGoogleEmailDto;

    const [user] = await this.db
      .select({
        googleEmail: users.googleEmail,
        username: users.username,
        id: users.id,
      })
      .from(users)
      .where(eq(users.googleEmail, googleEmail))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }

  async update(updateUserDto: UpdateUserDtoType) {
    const { id, ...maybeUpdatedFields } = updateUserDto;

    const setFields = Object.fromEntries(
      Object.entries(maybeUpdatedFields).filter(
        ([, value]) => value !== undefined,
      ),
    );

    if (Object.keys(setFields).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You need to specify at least one field",
      });
    }

    const [user] = await this.db
      .select({ email: users.email, hashedPassword: users.hashedPassword })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    let hashedPassword = "";

    if (setFields.password) {
      hashedPassword = await bcrypt.hash(setFields.password, this.saltRounds);
    }

    const [returningUser] = await this.db
      .update(users)
      .set({
        ...setFields,
        hashedPassword: setFields.password
          ? hashedPassword
          : user.hashedPassword,
      })
      .where(eq(users.id, id))
      .returning({
        username: users.username,
        email: users.email,
        profilePicture: users.profilePicture,
      });

    return returningUser;
  }

  async delete(deleteUserDto: DeleteUserDtoType) {
    const { id } = deleteUserDto;

    const [deletedUser] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
      });

    if (!deletedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return deletedUser;
  }
}
