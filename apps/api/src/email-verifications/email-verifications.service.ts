import { and, eq, gt, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { generateVerificationCode } from "@/common/utils/generate-verification-code";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { emailVerifications, users } from "@/drizzle/schema";
import { EmailService } from "@/email/email.service";
import { Inject, Injectable } from "@nestjs/common";
import { CreateEmailVerification as CreateEmailVerificationDtoType } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import { MAX_ATTEMPTS_EMAIL_VERIFICATION_VALID_CODE } from "./constants";
import {
  DeleteEmailVerificationDtoType,
  FindByIdDtoType,
  VerifyEmailCodeVerificationDtoType,
} from "./email-verifications.dto";

@Injectable()
export class EmailVerificationsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly emailService: EmailService,
  ) {}

  async create(createEmailVerificationDto: CreateEmailVerificationDtoType) {
    const { email, type } = createEmailVerificationDto;

    const [existingUserWithSameEmail] = await this.db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserWithSameEmail) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This email is already used",
      });
    }

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
        email: emailVerifications.email,
        code: emailVerifications.code,
      })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          gt(emailVerifications.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingValidEmailVerification) {
      await this.emailService.sendEmail({
        type,
        email: existingValidEmailVerification.email,
        code: existingValidEmailVerification.code,
      });

      return {
        verificationToken: existingValidEmailVerification.id,
        message: "Verification code resent",
      };
    }

    const generatedCode = generateVerificationCode();

    const [createdEmailVerification] = await this.db
      .insert(emailVerifications)
      .values({
        email,
        code: generatedCode,
      })
      .returning({
        id: emailVerifications.id,
      });

    await this.emailService.sendEmail({
      type,
      email,
      code: generatedCode,
    });

    return {
      verificationToken: createdEmailVerification.id,
      message: "Verification code sent",
    };
  }

  async findById(findByIdDto: FindByIdDtoType) {
    const { id } = findByIdDto;

    const [emailVerification] = await this.db
      .select({
        email: emailVerifications.email,
        id: emailVerifications.id,
        verifiedAt: emailVerifications.verifiedAt,
      })
      .from(emailVerifications)
      .where(eq(emailVerifications.id, id));

    if (!emailVerification) {
      return null;
    }

    return emailVerification;
  }

  async verifyCode(
    verifyEmailCodeVerificationDto: VerifyEmailCodeVerificationDtoType,
  ) {
    const { id, code } = verifyEmailCodeVerificationDto;

    // delete any expired email verification tied to this user
    await this.db
      .delete(emailVerifications)
      .where(
        and(
          eq(emailVerifications.id, id),
          lt(emailVerifications.expiresAt, new Date()),
        ),
      );

    const [existingValidEmailVerification] = await this.db
      .select({
        id: emailVerifications.id,
        code: emailVerifications.code,
        attempts: emailVerifications.attempts,
      })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.id, id),
          gt(emailVerifications.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!existingValidEmailVerification) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no email verification in process. Please go back and try again",
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

    await this.db
      .update(emailVerifications)
      .set({ verifiedAt: new Date() })
      .where(eq(emailVerifications.id, existingValidEmailVerification.id));

    return { message: "Code verified" };
  }

  async delete(deleteEmailVerificationDto: DeleteEmailVerificationDtoType) {
    const { id } = deleteEmailVerificationDto;

    const [deletedEmailVerification] = await this.db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, id))
      .returning({
        id: emailVerifications.id,
      });

    if (!deletedEmailVerification) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Email verification not found",
      });
    }

    return deletedEmailVerification;
  }
}
