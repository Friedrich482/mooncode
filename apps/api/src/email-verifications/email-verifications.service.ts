import * as bcrypt from "bcrypt";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generateVerificationCode } from "src/common/utils/generate-verification-code";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { emailVerifications, users } from "src/drizzle/schema";
import { EmailService } from "src/email/email.service";

import { Inject, Injectable } from "@nestjs/common";
import { CreateEmailVerification as CreateEmailVerificationDtoType } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import { MAX_ATTEMPTS_EMAIL_VERIFICATION_VALID_CODE } from "./constants";
import {
  DeleteEmailVerificationDtoType,
  FindOneEmailVerificationDtoType,
} from "./email-verifications.dto";

@Injectable()
export class EmailVerificationsService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService,
  ) {}

  async create(createEmailVerificationDto: CreateEmailVerificationDtoType) {
    const { email, username, password } = createEmailVerificationDto;

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

    // delete any expired email verification tied to this user
    await this.db
      .delete(emailVerifications)
      .where(
        and(
          or(
            eq(emailVerifications.email, email),
            eq(emailVerifications.username, username),
          ),
          lt(emailVerifications.expiresAt, new Date()),
        ),
      );

    const [existingValidEmailVerification] = await this.db
      .select()
      .from(emailVerifications)
      .where(
        and(
          or(
            eq(emailVerifications.email, email),
            eq(emailVerifications.username, username),
          ),
          gt(emailVerifications.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingValidEmailVerification) {
      await this.emailService.sendVerificationCode({
        email: existingValidEmailVerification.email,
        code: existingValidEmailVerification.code,
      });

      return {
        message: "Verification code resent",
      };
    }

    const generatedCode = generateVerificationCode();

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    await this.db
      .insert(emailVerifications)
      .values({
        email,
        username,
        hashedPassword,
        code: generatedCode,
      })
      .returning({
        id: emailVerifications.id,
        email: emailVerifications.email,
        username: emailVerifications.username,
      });

    await this.emailService.sendVerificationCode({
      email,
      code: generatedCode,
    });

    return { message: "Verification code sent" };
  }

  async findOne(findOneEmailVerificationDto: FindOneEmailVerificationDtoType) {
    const { email, code } = findOneEmailVerificationDto;

    // delete any expired email verification tied to this user
    await this.db
      .delete(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          lt(emailVerifications.expiresAt, new Date()),
        ),
      );

    const [existingValidEmailVerification] = await this.db
      .select({
        id: emailVerifications.id,
        username: emailVerifications.username,
        hashedPassword: emailVerifications.hashedPassword,
        email: emailVerifications.email,
        code: emailVerifications.code,
        attempts: emailVerifications.attempts,
      })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          gt(emailVerifications.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!existingValidEmailVerification) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You have no email verification. Please go back and try again",
      });
    }

    if (
      existingValidEmailVerification.attempts >=
      MAX_ATTEMPTS_EMAIL_VERIFICATION_VALID_CODE
    ) {
      await this.db
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, existingValidEmailVerification.id));

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many failed attempts. Please go back and try again",
      });
    }

    if (existingValidEmailVerification.code !== code) {
      await this.db
        .update(emailVerifications)
        .set({ attempts: existingValidEmailVerification.attempts + 1 })
        .where(eq(emailVerifications.id, existingValidEmailVerification.id));

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect code",
      });
    }

    const { code: existingValidCode, ...remaining } =
      existingValidEmailVerification;

    return remaining;
  }

  async delete(deleteEmailVerificationDto: DeleteEmailVerificationDtoType) {
    const { email } = deleteEmailVerificationDto;

    await this.db
      .delete(emailVerifications)
      .where(eq(emailVerifications.email, email));
  }
}
