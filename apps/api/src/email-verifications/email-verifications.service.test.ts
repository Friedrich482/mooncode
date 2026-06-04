import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import * as utils from "@/common/utils/generate-verification-code";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { EmailService } from "@/email/email.service";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import * as constants from "./constants";
import { EmailVerificationsService } from "./email-verifications.service";

describe("emailVerificationsService", () => {
  let emailVerificationsService: EmailVerificationsService;
  let emailService: { sendEmail: Mock<Procedure> };

  let mockedDrizzle: MockedDrizzle;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockedDrizzle = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      as: vi.fn(),
    };

    emailService = {
      sendEmail: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailVerificationsService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockedDrizzle,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    emailVerificationsService = moduleRef.get(EmailVerificationsService);
  });

  describe("create", () => {
    const mockedEntry = {
      email: "test@email.test",
      type: "onboarding" as const,
    };
    const mockedVerificationToken = "1";

    it("should return a verification token", async () => {
      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedVerificationToken },
      ]);

      const { verificationToken } =
        await emailVerificationsService.create(mockedEntry);

      expect(verificationToken).toBeDefined();
      expect(verificationToken).toEqual(mockedVerificationToken);
    });

    it("should return a confirmation message that the code has been sent", async () => {
      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedVerificationToken },
      ]);

      const { message } = await emailVerificationsService.create(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/verification code/i);
    });

    it("should call the sendEmail method of the emailService with the generated code", async () => {
      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedVerificationToken },
      ]);

      const spyGenerateVerificationCode = vi.spyOn(
        utils,
        "generateVerificationCode",
      );

      await emailVerificationsService.create(mockedEntry);

      expect(spyGenerateVerificationCode).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledOnce();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          code: spyGenerateVerificationCode.mock.results[0].value,
        }),
      );
    });

    it("should throw an error when the email is already used by another user", async () => {
      mockedDrizzle.limit.mockResolvedValueOnce([{ id: "1" }]);

      const error = await emailVerificationsService
        .create(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error).property("message").match(/email/);
    });

    it("should return the existing verification token when there is is already one", async () => {
      const mockedExistingVerificationToken = "4";

      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: mockedExistingVerificationToken,
          email: "test@email.test",
          code: "NNNUI78M",
        },
      ]);

      const { verificationToken } =
        await emailVerificationsService.create(mockedEntry);

      expect(verificationToken).toBeDefined();
      expect(verificationToken).toEqual(mockedExistingVerificationToken);
    });

    it("should return a confirmation message that the code has been resent when a verification token already exists", async () => {
      const mockedExistingVerificationToken = "4";

      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: mockedExistingVerificationToken,
          email: "test@email.test",
          code: "NNNUI78M",
        },
      ]);

      const { message } = await emailVerificationsService.create(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/resent/);
      expect(message).toMatch(/verification code/i);
    });

    it("should call the sendEmail method of the emailService with the existing code when a verification token already exists", async () => {
      const mockedExistingVerificationToken = "4";
      const mockedExistingVerificationCode = "NNNUI78M";

      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: mockedExistingVerificationToken,
          email: "test@email.test",
          code: mockedExistingVerificationCode,
        },
      ]);

      await emailVerificationsService.create(mockedEntry);

      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledOnce();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          code: mockedExistingVerificationCode,
        }),
      );
    });

    it("should not recall the generateVerificationCode when a verification token already exists", async () => {
      const mockedExistingVerificationToken = "4";
      const mockedExistingVerificationCode = "NNNUI78M";

      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: mockedExistingVerificationToken,
          email: "test@email.test",
          code: mockedExistingVerificationCode,
        },
      ]);

      const spyGenerateVerificationCode = vi.spyOn(
        utils,
        "generateVerificationCode",
      );

      await emailVerificationsService.create(mockedEntry);

      expect(spyGenerateVerificationCode).not.toHaveBeenCalled();
    });

    it("should delete any expired emailVerifications tied to that user", async () => {
      mockedDrizzle.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedVerificationToken },
      ]);

      await emailVerificationsService.create(mockedEntry);

      expect(mockedDrizzle.delete).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    const id = "1";
    const mockedEntry = {
      id,
    };

    it("should return the email verification found", async () => {
      const mockedFoundEmailVerification = {
        email: "test@email.test",
        id,
        verifiedAt: new Date(),
      };

      mockedDrizzle.where.mockResolvedValue([mockedFoundEmailVerification]);

      const foundEmailVerification =
        await emailVerificationsService.findById(mockedEntry);

      expect(foundEmailVerification).toBeDefined();
      expect(foundEmailVerification).toEqual(mockedFoundEmailVerification);
    });

    it("should return null when the email verification is not found", async () => {
      mockedDrizzle.where.mockResolvedValue([]);

      const foundEmailVerification =
        await emailVerificationsService.findById(mockedEntry);

      expect(foundEmailVerification).toBeNull();
    });
  });

  describe("verifyCode", () => {
    const mockedEntry = {
      id: "1",
      code: "NNNUI78M",
    };

    it("should return a message confirming that the code has been verified", async () => {
      const mockedExistingEmailVerification = {
        id: "1",
        code: "NNNUI78M",
        attempts: 0,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingEmailVerification]);

      const { message } =
        await emailVerificationsService.verifyCode(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/code/i);
    });

    it("should set the emailVerification status as verified", async () => {
      const mockedExistingEmailVerification = {
        id: "1",
        code: "NNNUI78M",
        attempts: 0,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingEmailVerification]);

      await emailVerificationsService.verifyCode(mockedEntry);

      expect(mockedDrizzle.set).toHaveBeenCalled();
      expect(mockedDrizzle.set).toHaveBeenCalledWith({
        verifiedAt: expect.anything(),
      });
    });

    it("should throw an error if there is no existing emailVerification associated with this token", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const error = await emailVerificationsService
        .verifyCode(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/email verification/);
    });

    it("should throw an error if the number of maximal attempts has been exceeded", async () => {
      const mockedExistingEmailVerification = {
        id: "1",
        code: "NNNUI78M",
        attempts: 4,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingEmailVerification]);

      vi.spyOn(
        constants,
        "MAX_ATTEMPTS_EMAIL_VERIFICATION_VALID_CODE",
        "get",
        // @ts-ignore
      ).mockReturnValue(3);

      const error = await emailVerificationsService
        .verifyCode(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("TOO_MANY_REQUESTS");
      expect(error)
        .property("message")
        .match(/too many/i);
    });

    it("should delete the existing email verification if the maximal number of attempts has been exceeded", async () => {
      const mockedExistingEmailVerification = {
        id: "1",
        code: "NNNUI78M",
        attempts: 4,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingEmailVerification]);

      vi.spyOn(
        constants,
        "MAX_ATTEMPTS_EMAIL_VERIFICATION_VALID_CODE",
        "get",
        // @ts-ignore
      ).mockReturnValue(3);

      await emailVerificationsService.verifyCode(mockedEntry).catch((e) => e);

      expect(mockedDrizzle.delete).toHaveBeenCalled();
    });

    it("should throw an error if the code provided is different from the code of the existing email verification", async () => {
      const mockedExistingEmailVerification = {
        id: "1",
        code: "NNNUI78M",
        attempts: 0,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingEmailVerification]);

      const error = await emailVerificationsService
        .verifyCode({ id: "1", code: "ZZUPB3AC" })
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error)
        .property("message")
        .match(/incorrect/i);
    });
  });

  describe("delete", () => {
    const id = "1";
    const mockedEntry = {
      id,
    };

    it("should return the deleted email verification", async () => {
      const mockedDeletedEmailVerification = {
        id,
      };

      mockedDrizzle.returning.mockResolvedValue([{ id }]);

      const deletedEmailVerification =
        await emailVerificationsService.delete(mockedEntry);

      expect(deletedEmailVerification).toBeDefined();
      expect(deletedEmailVerification).toEqual(mockedDeletedEmailVerification);
    });

    it("should throw an error if there is no email verification found", async () => {
      mockedDrizzle.returning.mockResolvedValue([]);

      const error = await emailVerificationsService
        .delete(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/email verification/i);
    });
  });
});
