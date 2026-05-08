import * as ResendModule from "resend";
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
  let envService: Partial<EnvService>;

  let resendSpy: Mock<typeof ResendModule.Resend>;
  let sendSpy: Mock<Procedure>;

  beforeEach(async () => {
    vi.clearAllMocks();

    resendSpy = vi.spyOn(ResendModule, "Resend");
    sendSpy = vi.fn();

    envService = {
      get: vi.fn().mockReturnValue("re_key"),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EnvService,
          useValue: envService,
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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: {
                id: mockedEmailSentId,
              },
              error: null,
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: null,
              error: {
                message: "Missing API key in the authorization header",
                name: "missing_api_key",
                statusCode: 401,
              },
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: {
                id: "1",
              },
              error: null,
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

      await emailService.sendEmail(mockedEntry);

      expect(resendSpy).toHaveBeenCalled();

      expect(spyGetOnboardingEmailBody).toHaveBeenCalled();
      expect(spyGetOnboardingEmailBody).toHaveBeenCalledWith(code);

      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith({
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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: {
                id: "1",
              },
              error: null,
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

      await emailService.sendEmail(mockedEntry);

      expect(resendSpy).toHaveBeenCalled();

      expect(spyGetPasswordResetEmailBody).toHaveBeenCalled();
      expect(spyGetPasswordResetEmailBody).toHaveBeenCalledWith(code);

      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith({
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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: {
                id: "1",
              },
              error: null,
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

      await emailService.sendEmail(mockedEntry);

      expect(resendSpy).toHaveBeenCalled();

      expect(spyGetEmailUpdateEmailBody).toHaveBeenCalled();
      expect(spyGetEmailUpdateEmailBody).toHaveBeenCalledWith(code);

      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith({
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

      resendSpy.mockImplementation(
        class Resend {
          emails = {
            send: sendSpy.mockResolvedValue({
              data: {
                id: "1",
              },
              error: null,
            }),
          };
        } as unknown as typeof ResendModule.Resend,
      );

      await emailService.sendEmail(mockedEntry);

      expect(resendSpy).toHaveBeenCalled();

      expect(spyGetEmailUpdateNoticeEmailBody).toHaveBeenCalled();
      expect(spyGetEmailUpdateNoticeEmailBody).toHaveBeenCalledWith();

      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith({
        from: expect.anything(),
        to: email,
        subject: expect.stringMatching(/update/i),
        html: spyGetEmailUpdateNoticeEmailBody.mock.results[0].value,
      });
    });
  });
});
