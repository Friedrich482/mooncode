import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { and, eq, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { users } from "src/drizzle/schema/users";

import { Inject, Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";

import {
  CreateGoogleUserDtoType,
  CreateUserDtoType,
  FindByEmailDtoType,
  FindByGoogleEmailDtoType,
  FindByIdDtoType,
  UpdateUserDtoType,
} from "./users.dto";

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase
  ) {}
  async create(createUserDto: CreateUserDtoType) {
    const { email, hashedPassword, username } = createUserDto;

    // check if a user with the email already exists
    const [existingUserWithSameEmail] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserWithSameEmail) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This email is already used",
      });
    }

    const [existingUserWithSameUsername] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserWithSameUsername) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This username already exists",
      });
    }

    const [userCreated] = await this.db
      .insert(users)
      .values({
        username,
        email,
        hashedPassword,
        profilePicture: "picture",
        emailVerifiedAt: new Date(),
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
    const [existingUserWithSameGoogleEmail] = await this.db
      .select()
      .from(users)
      .where(
        and(
          or(eq(users.googleEmail, googleEmail), eq(users.email, email)),
          eq(users.googleId, googleId)
        )
      )
      .limit(1);

    if (existingUserWithSameGoogleEmail) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This google email is already used",
      });
    }

    const [existingUserWithSameUsername] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserWithSameUsername) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This google username already exists",
      });
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
        googleId: googleId,
        googleEmail,
        authMethod: "google",
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });
    return userCreated;
  }

  async findOne(findByIdDto: FindByIdDtoType) {
    const { id } = findByIdDto;

    const [user] = await this.db
      .select({
        email: users.email,
        username: users.username,
        id: users.id,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    return user;
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

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
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

    return user;
  }

  async update(updateUserDto: UpdateUserDtoType) {
    const { id, ...maybeUpdatedFields } = updateUserDto;

    const setFields = Object.fromEntries(
      Object.entries(maybeUpdatedFields).filter(
        ([, value]) => value !== undefined
      )
    );

    if (Object.keys(setFields).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You need to specify at least one field",
      });
    }

    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    if (setFields.password) {
      setFields.password = await bcrypt.hash(
        setFields.password,
        this.saltRounds
      );
    }

    const [returningUser] = await this.db
      .update(users)
      .set(setFields)
      .where(eq(users.id, id))
      .returning({
        username: users.username,
        email: users.email,
        profilePicture: users.profilePicture,
      });

    return returningUser;
  }
}
