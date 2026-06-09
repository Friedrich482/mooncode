import { and, eq, gt, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { generateVerificationCode } from "@/common/utils/generate-verification-code";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { users } from "@/drizzle/schema";
import { passwordResets } from "@/drizzle/schema/password-resets";
import { EmailService } from "@/email/email.service";
import { Inject, Injectable } from "@nestjs/common";
import {
  CreatePasswordReset as CreatePasswordResetDtoType,
  VerifyPasswordResetCode as VerifyPasswordResetCodeDtoType,
} from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import { MAX_ATTEMPTS_PASSWORD_RESET } from "./constants";
import {
  DeletePasswordResetDtoType,
  FindByIdDtoType,
} from "./password-resets.dto";

@Injectable()
export class PasswordResetsService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService,
  ) {}

  async create(createPasswordResetDto: CreatePasswordResetDtoType) {
    const { email } = createPasswordResetDto;

    const [user] = await this.db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // delete any expired password reset tied to this user
    await this.db
      .delete(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          lt(passwordResets.expiresAt, new Date()),
        ),
      );

    const [existingValidPasswordReset] = await this.db
      .select({
        id: passwordResets.id,
        email: passwordResets.email,
        code: passwordResets.code,
      })
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          gt(passwordResets.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingValidPasswordReset) {
      await this.emailService.sendEmail({
        type: "password reset",
        email: existingValidPasswordReset.email,
        code: existingValidPasswordReset.code,
      });

      return {
        message: "Verification code resent",
        passwordResetToken: existingValidPasswordReset.id,
      };
    }

    const generatedCode = generateVerificationCode();

    const [createdPasswordReset] = await this.db
      .insert(passwordResets)
      .values({
        email,
        code: generatedCode,
        userId: user.id,
      })
      .returning({
        id: passwordResets.id,
      });

    await this.emailService.sendEmail({
      type: "password reset",
      email,
      code: generatedCode,
    });

    return {
      passwordResetToken: createdPasswordReset.id,
      message: "Verification code sent",
    };
  }

  async findById(findByIdDto: FindByIdDtoType) {
    const { id } = findByIdDto;

    const [existingPasswordReset] = await this.db
      .select({
        email: passwordResets.email,
        code: passwordResets.code,
      })
      .from(passwordResets)
      .where(eq(passwordResets.id, id))
      .limit(1);

    if (!existingPasswordReset) {
      return null;
    }

    return existingPasswordReset;
  }

  async verifyCode(verifyPasswordResetCodeDto: VerifyPasswordResetCodeDtoType) {
    const { id, code } = verifyPasswordResetCodeDto;

    // delete any expired password reset tied to this user
    await this.db
      .delete(passwordResets)
      .where(
        and(
          eq(passwordResets.id, id),
          lt(passwordResets.expiresAt, new Date()),
        ),
      );

    const [existingValidPasswordReset] = await this.db
      .select({
        id: passwordResets.id,
        code: passwordResets.code,
        attempts: passwordResets.attempts,
      })
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.id, id),
          gt(passwordResets.expiresAt, new Date()),
        ),
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
        message:
          "Too many failed attempts. Please request a new password reset",
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

  async delete(deletePasswordResetDto: DeletePasswordResetDtoType) {
    const { id } = deletePasswordResetDto;

    const [deletedPasswordReset] = await this.db
      .delete(passwordResets)
      .where(eq(passwordResets.id, id))
      .returning({
        id: passwordResets.id,
      });

    if (!deletedPasswordReset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Password reset not found",
      });
    }

    return deletedPasswordReset;
  }
}
