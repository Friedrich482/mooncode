import { z } from "zod";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "@repo/common/constants";

export const SendEmailDto = z.discriminatedUnion("type", [
  z.object({
    email: z.email(),
    type: z.literal("onboarding"),
    code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
  }),
  z.object({
    email: z.email(),
    type: z.literal("email update"),
    code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
  }),
  z.object({
    email: z.email(),
    type: z.literal("notice email update"),
  }),
]);

export const FindByIdDto = z.object({
  id: z.ulid(),
});

export const VerifyEmailCodeVerificationDto = z.object({
  id: z.ulid(),
  code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
});

export const DeleteEmailVerificationDto = z.object({
  id: z.ulid(),
});

export type SendEmailDtoType = z.infer<typeof SendEmailDto>;

export type FindByIdDtoType = z.infer<typeof FindByIdDto>;

export type VerifyEmailCodeVerificationDtoType = z.infer<
  typeof VerifyEmailCodeVerificationDto
>;

export type DeleteEmailVerificationDtoType = z.infer<
  typeof DeleteEmailVerificationDto
>;
