import * as bcrypt from "bcrypt";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { pendingRegistrations, users } from "src/drizzle/schema";
import { EmailService } from "src/email/email.service";

import { Inject, Injectable } from "@nestjs/common";
import { CreatePendingRegistrationDtoType } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import {
  DeletePendingRegistrationAfterRegistrationDtoType,
  FindPendingRegistrationByEmailDtoType,
} from "./pending-registration.dto";
import generateVerificationCode from "./utils/generateVerificationCode";

@Injectable()
export class PendingRegistrationsService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService
  ) {}

  async create(createPendingRegistrationDto: CreatePendingRegistrationDtoType) {
    const { email, username, password } = createPendingRegistrationDto;

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

    // delete any invalid pending registration tied to this user
    await this.db
      .delete(pendingRegistrations)
      .where(
        and(
          or(
            eq(pendingRegistrations.email, email),
            eq(pendingRegistrations.username, username)
          ),
          lt(pendingRegistrations.expiresAt, new Date())
        )
      );

    const [existingValidPendingRegistration] = await this.db
      .select()
      .from(pendingRegistrations)
      .where(
        and(
          or(
            eq(pendingRegistrations.email, email),
            eq(pendingRegistrations.username, username)
          ),
          gt(pendingRegistrations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (existingValidPendingRegistration) {
      await this.emailService.sendVerificationCode({
        email: existingValidPendingRegistration.email,
        code: existingValidPendingRegistration.code,
      });

      return {
        id: existingValidPendingRegistration.id,
        email: existingValidPendingRegistration.email,
        username: existingValidPendingRegistration.username,
        message: "Verification code resent",
      };
    }

    const generatedCode = generateVerificationCode();

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const [createdPendingRegistration] = await this.db
      .insert(pendingRegistrations)
      .values({
        email,
        username,
        hashedPassword,
        code: generatedCode,
      })
      .returning({
        id: pendingRegistrations.id,
        email: pendingRegistrations.email,
        username: pendingRegistrations.username,
      });

    await this.emailService.sendVerificationCode({
      email,
      code: generatedCode,
    });

    return { ...createdPendingRegistration, message: "Verification code sent" };
  }

  async findByEmail(
    findPendingRegistrationByEmailType: FindPendingRegistrationByEmailDtoType
  ) {
    const { email, code } = findPendingRegistrationByEmailType;

    // delete any invalid pending registration tied to this user
    await this.db
      .delete(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, email),
          lt(pendingRegistrations.expiresAt, new Date())
        )
      );

    const [existingValidPendingRegistration] = await this.db
      .select({
        username: pendingRegistrations.username,
        hashedPassword: pendingRegistrations.hashedPassword,
        email: pendingRegistrations.email,
        code: pendingRegistrations.code,
      })
      .from(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, email),
          gt(pendingRegistrations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!existingValidPendingRegistration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You have no pending registration. Go back and try again",
      });
    }

    if (existingValidPendingRegistration.code !== code) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect code",
      });
    }

    const { code: existingValidCode, ...remaining } =
      existingValidPendingRegistration;

    return remaining;
  }

  async deleteAfterRegistration(
    deletePendingRegistrationAfterRegistrationDto: DeletePendingRegistrationAfterRegistrationDtoType
  ) {
    const { email } = deletePendingRegistrationAfterRegistrationDto;

    await this.db
      .delete(pendingRegistrations)
      .where(eq(pendingRegistrations.email, email));
  }
}
