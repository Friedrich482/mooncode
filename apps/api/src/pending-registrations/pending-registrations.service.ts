import * as bcrypt from "bcrypt";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generateVerificationCode } from "src/common/utils/generate-verification-code";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { pendingRegistrations, users } from "src/drizzle/schema";
import { EmailService } from "src/email/email.service";

import { Inject, Injectable } from "@nestjs/common";
import { CreatePendingRegistration as CreatePendingRegistrationDtoType } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import { MAX_ATTEMPTS_PENDING_REGISTRATION_VALID_CODE } from "./constants";
import {
  DeletePendingRegistrationDtoType,
  FindOnePendingRegistrationDtoType,
} from "./pending-registration.dto";

@Injectable()
export class PendingRegistrationsService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService,
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

    // delete any expired pending registration tied to this user
    await this.db
      .delete(pendingRegistrations)
      .where(
        and(
          or(
            eq(pendingRegistrations.email, email),
            eq(pendingRegistrations.username, username),
          ),
          lt(pendingRegistrations.expiresAt, new Date()),
        ),
      );

    const [existingValidPendingRegistration] = await this.db
      .select()
      .from(pendingRegistrations)
      .where(
        and(
          or(
            eq(pendingRegistrations.email, email),
            eq(pendingRegistrations.username, username),
          ),
          gt(pendingRegistrations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingValidPendingRegistration) {
      await this.emailService.sendVerificationCode({
        email: existingValidPendingRegistration.email,
        code: existingValidPendingRegistration.code,
      });

      return {
        message: "Verification code resent",
      };
    }

    const generatedCode = generateVerificationCode();

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    await this.db
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

    return { message: "Verification code sent" };
  }

  async findOne(
    findOnePendingRegistrationDto: FindOnePendingRegistrationDtoType,
  ) {
    const { email, code } = findOnePendingRegistrationDto;

    // delete any expired pending registration tied to this user
    await this.db
      .delete(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, email),
          lt(pendingRegistrations.expiresAt, new Date()),
        ),
      );

    const [existingValidPendingRegistration] = await this.db
      .select({
        id: pendingRegistrations.id,
        username: pendingRegistrations.username,
        hashedPassword: pendingRegistrations.hashedPassword,
        email: pendingRegistrations.email,
        code: pendingRegistrations.code,
        attempts: pendingRegistrations.attempts,
      })
      .from(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, email),
          gt(pendingRegistrations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!existingValidPendingRegistration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no pending registration. Please go back and try again",
      });
    }

    if (
      existingValidPendingRegistration.attempts >=
      MAX_ATTEMPTS_PENDING_REGISTRATION_VALID_CODE
    ) {
      await this.db
        .delete(pendingRegistrations)
        .where(
          eq(pendingRegistrations.id, existingValidPendingRegistration.id),
        );

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many failed attempts. Please go back and try again",
      });
    }

    if (existingValidPendingRegistration.code !== code) {
      await this.db
        .update(pendingRegistrations)
        .set({ attempts: existingValidPendingRegistration.attempts + 1 })
        .where(
          eq(pendingRegistrations.id, existingValidPendingRegistration.id),
        );

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect code",
      });
    }

    const { code: existingValidCode, ...remaining } =
      existingValidPendingRegistration;

    return remaining;
  }

  async delete(deletePendingRegistrationDto: DeletePendingRegistrationDtoType) {
    const { email } = deletePendingRegistrationDto;

    await this.db
      .delete(pendingRegistrations)
      .where(eq(pendingRegistrations.email, email));
  }
}
