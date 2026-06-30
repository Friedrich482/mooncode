import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import * as utils from "@/common/utils/generate-verification-code";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { EmailService } from "@/email/email.service";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import * as constants from "./constants";
import { PasswordResetsService } from "./password-resets.service";

describe("passwordResetsService", () => {
  let passwordResetsService: PasswordResetsService;
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
      execute: vi.fn(),
    };

    emailService = {
      sendEmail: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PasswordResetsService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockedDrizzle,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    passwordResetsService = moduleRef.get(PasswordResetsService);
  });

  describe("create", () => {
    const mockedEntry = {
      email: "test@email.test",
    };
    const mockedPasswordResetToken = "1";

    it("should return a password reset token", async () => {
      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([]);

      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedPasswordResetToken },
      ]);

      const { passwordResetToken } =
        await passwordResetsService.create(mockedEntry);

      expect(passwordResetToken).toBeDefined();
      expect(passwordResetToken).toEqual(mockedPasswordResetToken);
    });

    it("should return a message confirming that the verification code has been sent", async () => {
      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([]);

      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedPasswordResetToken },
      ]);

      const { message } = await passwordResetsService.create(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/verification code/i);
    });

    it("should call the sendEmail method of the emailService with the generated code", async () => {
      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([]);

      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedPasswordResetToken },
      ]);

      const spyGenerateVerificationCode = vi.spyOn(
        utils,
        "generateVerificationCode",
      );

      await passwordResetsService.create(mockedEntry);

      expect(spyGenerateVerificationCode).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledOnce();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          code: spyGenerateVerificationCode.mock.results[0].value,
        }),
      );
    });

    it("should throw an error when the user is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const error = await passwordResetsService
        .create(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });

    it("should return the existing password reset token when there is already one", async () => {
      const mockedExistingPasswordResetToken = "4";

      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([
          {
            id: mockedExistingPasswordResetToken,
            email: "test@email.test",
            code: "NNNUI78M",
          },
        ]);

      const { passwordResetToken } =
        await passwordResetsService.create(mockedEntry);

      expect(passwordResetToken).toBeDefined();
      expect(passwordResetToken).toEqual(mockedExistingPasswordResetToken);
    });

    it("should return a message confirming that the code has been resent when a password reset token already exists", async () => {
      const mockedExistingPasswordResetToken = "4";

      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([
          {
            id: mockedExistingPasswordResetToken,
            email: "test@email.test",
            code: "NNNUI78M",
          },
        ]);

      const { message } = await passwordResetsService.create(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/verification code/i);
      expect(message).toMatch(/resent/i);
    });

    it("should call the sendEmail method of the emailService with the existing code when a password reset token already exists", async () => {
      const mockedExistingPasswordResetToken = "4";
      const mockedExistingVerificationCode = "NNNUI78M";

      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([
          {
            id: mockedExistingPasswordResetToken,
            email: "test@email.test",
            code: mockedExistingVerificationCode,
          },
        ]);

      await passwordResetsService.create(mockedEntry);

      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledOnce();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          code: mockedExistingVerificationCode,
        }),
      );
    });

    it("should not recall the generateVerificationCode when a password reset token already exists", async () => {
      const mockedExistingPasswordResetToken = "4";
      const mockedExistingVerificationCode = "NNNUI78M";

      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([
          {
            id: mockedExistingPasswordResetToken,
            email: "test@email.test",
            code: mockedExistingVerificationCode,
          },
        ]);

      const spyGenerateVerificationCode = vi.spyOn(
        utils,
        "generateVerificationCode",
      );

      await passwordResetsService.create(mockedEntry);

      expect(spyGenerateVerificationCode).not.toHaveBeenCalled();
    });

    it("should delete any expired passwordReset tied to that user", async () => {
      mockedDrizzle.limit
        .mockResolvedValueOnce([{ id: "2" }])
        .mockResolvedValueOnce([]);
      mockedDrizzle.returning.mockResolvedValue([
        { id: mockedPasswordResetToken },
      ]);

      await passwordResetsService.create(mockedEntry);

      expect(mockedDrizzle.delete).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    const mockedEntry = {
      id: "1",
    };

    it("should return the password reset found", async () => {
      const mockedFoundPasswordReset = {
        email: "test@email.test",
        code: "NNNUI78M",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundPasswordReset]);

      const foundPasswordReset =
        await passwordResetsService.findById(mockedEntry);

      expect(foundPasswordReset).toBeDefined();
      expect(foundPasswordReset).toEqual(mockedFoundPasswordReset);
    });

    it("should return null when the password reset is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const foundPasswordReset =
        await passwordResetsService.findById(mockedEntry);

      expect(foundPasswordReset).toBeNull();
    });
  });

  describe("verifyCode", () => {
    const mockedEntry = {
      id: "1",
      code: "NNNUI78M",
    };

    it("should return a message confirming that the code has been verified", async () => {
      const mockedExistingPasswordReset = {
        id: "1",
        code: "NNNUI78M",
        attempts: 0,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingPasswordReset]);

      const { message } = await passwordResetsService.verifyCode(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/code/i);
    });

    it("should throw an error if there is no existing password reset associated with the password reset token provided", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const error = await passwordResetsService
        .verifyCode(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/password reset/);
    });

    it("should throw an error if the number of maximal attempts has been exceeded", async () => {
      const mockedExistingPasswordReset = {
        id: "1",
        code: "NNNUI78M",
        attempts: 4,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingPasswordReset]);

      vi.spyOn(constants, "MAX_ATTEMPTS_PASSWORD_RESET", "get").mockReturnValue(
        // @ts-ignore
        3,
      );

      const error = await passwordResetsService
        .verifyCode(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("TOO_MANY_REQUESTS");
      expect(error)
        .property("message")
        .match(/too many/i);
    });

    it("should delete the existing password reset if the maximal number of attempts has been exceeded", async () => {
      const mockedExistingPasswordReset = {
        id: "1",
        code: "NNNUI78M",
        attempts: 4,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingPasswordReset]);

      await passwordResetsService.verifyCode(mockedEntry).catch((e) => e);
      expect(mockedDrizzle.delete).toHaveBeenCalled();
    });

    it("should throw an error if the code provided is different from the code of the existing password reset", async () => {
      const mockedExistingPasswordReset = {
        id: "1",
        code: "NNNUI78M",
        attempts: 0,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedExistingPasswordReset]);

      const error = await passwordResetsService
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

    it("should return the deleted password reset", async () => {
      const mockedDeletedPasswordReset = {
        id,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedDeletedPasswordReset]);

      const deletedPasswordReset =
        await passwordResetsService.delete(mockedEntry);

      expect(deletedPasswordReset).toBeDefined();
      expect(deletedPasswordReset).toEqual(mockedDeletedPasswordReset);
    });

    it("should throw an error if there is no password reset found", async () => {
      mockedDrizzle.returning.mockResolvedValue([]);

      const error = await passwordResetsService
        .delete(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/password reset/i);
    });
  });
});
