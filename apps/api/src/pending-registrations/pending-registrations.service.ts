import * as bcrypt from "bcrypt";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { pendingRegistrations, users } from "src/drizzle/schema";
import { EmailService } from "src/email/email.service";

import { Inject, Injectable } from "@nestjs/common";
import { CreatePendingRegistrationDtoType } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

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
        password: hashedPassword,
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

    return createdPendingRegistration;
  }

  delete(id: number) {
    return `This action removes a #${id} pendingRegistration`;
  }
}
