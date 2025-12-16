import { and, eq, gt, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import generateVerificationCode from "src/common/utils/generateVerificationCode";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { users } from "src/drizzle/schema";
import { passwordResets } from "src/drizzle/schema/passwordResets";
import { EmailService } from "src/email/email.service";

import { Inject, Injectable } from "@nestjs/common";
import {
  CreatePasswordResetDtoType,
  VerifyPasswordResetCodeDtoType,
} from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import { MAX_ATTEMPTS_PASSWORD_RESET } from "./constants";
import { DeletePasswordResetAfterResetDtoType } from "./password-resets.dto";

@Injectable()
export class PasswordResetsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService
  ) {}
  async create(createPasswordResetDto: CreatePasswordResetDtoType) {
    const { email } = createPasswordResetDto;

    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // don't send the email back to avoid email enumeration
      return {
        message: "We have sent you a code at your email address",
      };
    }

    // delete any expired password reset tied to this user
    await this.db
      .delete(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          lt(passwordResets.expiresAt, new Date())
        )
      );

    const [existingValidPasswordReset] = await this.db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          gt(passwordResets.expiresAt, new Date())
        )
      )
      .limit(1);

    if (existingValidPasswordReset) {
      await this.emailService.sendResetPasswordCode({
        email: existingValidPasswordReset.email,
        code: existingValidPasswordReset.code,
      });

      return {
        message: "Verification code resent",
      };
    }

    const generatedCode = generateVerificationCode();

    await this.db.insert(passwordResets).values({
      email,
      code: generatedCode,
      userId: user.id,
    });

    await this.emailService.sendResetPasswordCode({
      email,
      code: generatedCode,
    });

    return {
      message: "Verification code sent",
    };
  }

  async verifyCode(verifyPasswordResetCodeDto: VerifyPasswordResetCodeDtoType) {
    const { email, code } = verifyPasswordResetCodeDto;

    // delete any expired password reset tied to this user
    await this.db
      .delete(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          lt(passwordResets.expiresAt, new Date())
        )
      );

    const [existingValidPasswordReset] = await this.db
      .select({
        id: passwordResets.id,
        email: passwordResets.email,
        code: passwordResets.code,
        attempts: passwordResets.attempts,
      })
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          gt(passwordResets.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!existingValidPasswordReset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no password reset in progress. Go back and try again",
      });
    }

    if (existingValidPasswordReset.attempts >= MAX_ATTEMPTS_PASSWORD_RESET) {
      await this.db
        .delete(passwordResets)
        .where(eq(passwordResets.id, existingValidPasswordReset.id));

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many failed attempts. Please request a new reset",
      });
    }

    if (existingValidPasswordReset.code !== code) {
      await this.db
        .update(passwordResets)
        .set({ attempts: existingValidPasswordReset.attempts + 1 })
        .where(eq(passwordResets.id, existingValidPasswordReset.id));

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect code",
      });
    }

    return {
      message: "Code verified",
    };
  }

  async deletePasswordResetAfterReset(
    deletePasswordResetAfterResetDto: DeletePasswordResetAfterResetDtoType
  ) {
    const { email } = deletePasswordResetAfterResetDto;

    await this.db.delete(passwordResets).where(eq(passwordResets.email, email));
  }
}
