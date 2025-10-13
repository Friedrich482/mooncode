import * as bcrypt from "bcrypt";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateGoogleUserDtoType,
  CreateUserDtoType,
  FindByEmailDtoType,
  FindByGoogleEmailDtoType,
  FindByIdDtoType,
  UpdateUserDtoType,
} from "./users.dto";
import { and, eq, or } from "drizzle-orm";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { users } from "src/drizzle/schema/users";

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
  ) {}
  async create(createUserDto: CreateUserDtoType) {
    const { email, password, username } = createUserDto;

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

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const [userCreated] = await this.db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        profilePicture: "picture",
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
          eq(users.googleId, googleId),
        ),
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
        password: hashedPassword,
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
    if (!user) throw new NotFoundException("User not found");
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
        password: users.password,
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
        ([, value]) => value !== undefined,
      ),
    );

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundException("User not found");

    if (setFields.password) {
      setFields.password = await bcrypt.hash(
        setFields.password,
        this.saltRounds,
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
