import { CreateEmailResponseSuccess, Resend, Response } from "resend";

import { EnvService } from "@/env/env.service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";

import { SUPPORT_EMAIL } from "./constants";
import { SendEmailDtoType } from "./email.dto";
import { getEmailUpdateEmailBody } from "./utils/get-email-update-email-body";
import { getEmailUpdateNoticeEmailBody } from "./utils/get-email-update-notice-email-body";
import { getOnboardingEmailBody } from "./utils/get-onboarding-email-body";
import { getPasswordResetEmailBody } from "./utils/get-password-reset-email-body";

@Injectable()
export class EmailService {
  private readonly logger = new Logger("EmailService", { timestamp: true });
  constructor(
    private readonly envService: EnvService,

    @Inject("resend")
    private readonly resend: Resend,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDtoType) {
    const { type, email } = sendEmailDto;

    let result: Response<CreateEmailResponseSuccess> = {
      data: {
        id: "",
      },
      error: null,
      headers: {},
    };

    switch (type) {
      case "onboarding":
        result = await this.resend.emails.send({
          from: this.envService.get("ONBOARDING_EMAIL"),
          to: email,
          subject: "Email verification",
          html: getOnboardingEmailBody(sendEmailDto.code),
        });

        break;

      case "password reset":
        result = await this.resend.emails.send({
          from: this.envService.get("RESET_PASSWORD_EMAIL"),
          to: email,
          subject: "Reset Password",
          html: getPasswordResetEmailBody(sendEmailDto.code),
        });

        break;

      case "email update":
        result = await this.resend.emails.send({
          from: this.envService.get("UPDATE_EMAIL_EMAIL"),
          to: email,
          subject: "Email Update",
          html: getEmailUpdateEmailBody(sendEmailDto.code),
        });

        break;

      case "notice email update":
        result = await this.resend.emails.send({
          from: this.envService.get("UPDATE_EMAIL_EMAIL"),
          to: email,
          subject: "Notice Email Update",
          html: getEmailUpdateNoticeEmailBody(),
        });

        break;

      default:
        throw type satisfies never;
    }

    const { data, error } = result;

    if (error) {
      this.logger.error(
        `Error while sending a ${type} email. Error Message: ${error.message}, name: ${error.name}, code: ${error.statusCode}`,
      );

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `An error occurred while sending your ${type} email. Please contact ${SUPPORT_EMAIL}`,
      });
    }

    return data;
  }
}
