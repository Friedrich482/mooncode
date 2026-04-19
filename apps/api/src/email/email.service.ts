import { Resend } from "resend";

import { EnvService } from "@/env/env.service";
import { Injectable } from "@nestjs/common";

import { SendEmailDtoType } from "./email.dto";
import { getEmailUpdateEmailBody } from "./utils/get-email-update-email-body";
import { getEmailUpdateNoticeEmailBody } from "./utils/get-email-update-notice-email-body";
import { getOnboardingEmailBody } from "./utils/get-onboarding-email-body";
import { getPasswordResetEmailBody } from "./utils/get-password-reset-email-body";

@Injectable()
export class EmailService {
  constructor(private readonly envService: EnvService) {}

  async sendEmail(sendEmailDto: SendEmailDtoType) {
    const { type, email } = sendEmailDto;
    const resend = new Resend(this.envService.get("RESEND_API_KEY"));

    switch (type) {
      case "onboarding":
        resend.emails.send({
          from: this.envService.get("ONBOARDING_EMAIL"),
          to: email,
          subject: "Email verification",
          html: getOnboardingEmailBody(sendEmailDto.code),
        });

        break;

      case "password reset":
        resend.emails.send({
          from: this.envService.get("RESET_PASSWORD_EMAIL"),
          to: email,
          subject: "Reset Password",
          html: getPasswordResetEmailBody(sendEmailDto.code),
        });

        break;

      case "email update":
        resend.emails.send({
          from: this.envService.get("UPDATE_EMAIL_EMAIL"),
          to: email,
          subject: "Email Update",
          html: getEmailUpdateEmailBody(sendEmailDto.code),
        });

        break;

      case "notice email update":
        resend.emails.send({
          from: this.envService.get("UPDATE_EMAIL_EMAIL"),
          to: email,
          subject: "Notice Email Update",
          html: getEmailUpdateNoticeEmailBody(),
        });

        break;

      default:
        throw type satisfies never;
    }
  }
}
