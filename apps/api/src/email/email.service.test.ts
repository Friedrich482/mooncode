import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EnvService } from "@/env/env.service";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import { EmailService } from "./email.service";
import * as getEmailUpdateEmailBody from "./utils/get-email-update-email-body";
import * as getEmailUpdateNoticeEmailBody from "./utils/get-email-update-notice-email-body";
import * as getOnboardingEmailBody from "./utils/get-onboarding-email-body";
import * as getPasswordResetEmailBody from "./utils/get-password-reset-email-body";

describe("emailService", () => {
  let emailService: EmailService;
  let envService: { get: Mock<Procedure> };
  let resend: {
    emails: {
      send: Mock<Procedure>;
    };
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    envService = {
      get: vi.fn().mockReturnValue("re_key"),
    };

    resend = {
      emails: {
        send: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EnvService,
          useValue: envService,
        },
        {
          provide: "resend",
          useValue: resend,
        },
      ],
    }).compile();

    // disable logging (especially errors) during testing
    moduleRef.useLogger(false);

    emailService = moduleRef.get(EmailService);
  });

  describe("sendEmail", () => {
    const email = "test@email.test";
    const code = "ZUSTAND9";

    it("should return the id of the email sent", async () => {
      const mockedEntry = {
        type: "onboarding" as const,
        email,
        code,
      };

      const mockedEmailSentId = "1";

      resend.emails.send.mockResolvedValue({
        data: {
          id: mockedEmailSentId,
        },
        error: null,
      });

      const data = await emailService.sendEmail(mockedEntry);

      expect(data).toBeDefined();
      expect(data.id).toBe(mockedEmailSentId);
    });

    it("should throw the error returned by resend if there is one", async () => {
      const mockedEntry = {
        type: "onboarding" as const,
        email,
        code,
      };

      resend.emails.send.mockResolvedValue({
        data: null,
        error: {
          message: "Missing API key in the authorization header",
          name: "missing_api_key",
          statusCode: 401,
        },
      });

      const error = await emailService.sendEmail(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("INTERNAL_SERVER_ERROR");
      expect(error)
        .property("message")
        .match(/error occurred/);
    });

    it("should call resend with the proper parameters when the email type is 'onboarding'", async () => {
      const mockedEntry = {
        type: "onboarding" as const,
        email,
        code,
      };

      const spyGetOnboardingEmailBody = vi.spyOn(
        getOnboardingEmailBody,
        "getOnboardingEmailBody",
      );

      resend.emails.send.mockResolvedValue({
        data: {
          id: "1",
        },
        error: null,
      });

      await emailService.sendEmail(mockedEntry);

      expect(spyGetOnboardingEmailBody).toHaveBeenCalled();
      expect(spyGetOnboardingEmailBody).toHaveBeenCalledWith(code);

      expect(resend.emails.send).toHaveBeenCalled();
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: expect.anything(),
        to: email,
        subject: expect.stringMatching(/verification/),
        html: spyGetOnboardingEmailBody.mock.results[0].value,
      });
    });

    it("should call resend with the proper parameters when the email type is 'password reset'", async () => {
      const mockedEntry = {
        type: "password reset" as const,
        email,
        code,
      };

      const spyGetPasswordResetEmailBody = vi.spyOn(
        getPasswordResetEmailBody,
        "getPasswordResetEmailBody",
      );

      resend.emails.send.mockResolvedValue({
        data: {
          id: "1",
        },
        error: null,
      });

      await emailService.sendEmail(mockedEntry);

      expect(spyGetPasswordResetEmailBody).toHaveBeenCalled();
      expect(spyGetPasswordResetEmailBody).toHaveBeenCalledWith(code);

      expect(resend.emails.send).toHaveBeenCalled();
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: expect.anything(),
        to: email,
        subject: expect.stringMatching(/reset password/i),
        html: spyGetPasswordResetEmailBody.mock.results[0].value,
      });
    });

    it("should call resend with the proper parameters when the email type is 'email update'", async () => {
      const mockedEntry = {
        type: "email update" as const,
        email,
        code,
      };

      const spyGetEmailUpdateEmailBody = vi.spyOn(
        getEmailUpdateEmailBody,
        "getEmailUpdateEmailBody",
      );

      resend.emails.send.mockResolvedValue({
        data: {
          id: "1",
        },
        error: null,
      });

      await emailService.sendEmail(mockedEntry);

      expect(spyGetEmailUpdateEmailBody).toHaveBeenCalled();
      expect(spyGetEmailUpdateEmailBody).toHaveBeenCalledWith(code);

      expect(resend.emails.send).toHaveBeenCalled();
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: expect.anything(),
        to: email,
        subject: expect.stringMatching(/update/i),
        html: spyGetEmailUpdateEmailBody.mock.results[0].value,
      });
    });

    it("should call resend with the proper parameters when the email type is 'notice email update'", async () => {
      const mockedEntry = {
        type: "notice email update" as const,
        email,
        code,
      };

      const spyGetEmailUpdateNoticeEmailBody = vi.spyOn(
        getEmailUpdateNoticeEmailBody,
        "getEmailUpdateNoticeEmailBody",
      );

      resend.emails.send.mockResolvedValue({
        data: {
          id: "1",
        },
        error: null,
      });

      await emailService.sendEmail(mockedEntry);

      expect(spyGetEmailUpdateNoticeEmailBody).toHaveBeenCalled();
      expect(spyGetEmailUpdateNoticeEmailBody).toHaveBeenCalledWith();

      expect(resend.emails.send).toHaveBeenCalled();
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: expect.anything(),
        to: email,
        subject: expect.stringMatching(/update/i),
        html: spyGetEmailUpdateNoticeEmailBody.mock.results[0].value,
      });
    });
  });
});
