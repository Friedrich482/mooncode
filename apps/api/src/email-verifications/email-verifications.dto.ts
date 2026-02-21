import { z } from "zod";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "@repo/common/constants";

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

export type FindByIdDtoType = z.infer<typeof FindByIdDto>;

export type VerifyEmailCodeVerificationDtoType = z.infer<
  typeof VerifyEmailCodeVerificationDto
>;

export type DeleteEmailVerificationDtoType = z.infer<
  typeof DeleteEmailVerificationDto
>;
