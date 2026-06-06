import { z } from "zod";

import { EmailSchema, UserId } from "@repo/common/types-schemas";

export const CheckAuthStatusDto = z.object({
  user: z.object({ sub: z.ulid() }),
});

export const GetUserDto = z.object({
  user: z.object({ sub: z.ulid() }),
});

export const HandleGoogleQueryDto = z.union([
  z.object({ code: z.string().min(1) }),
  z.object({ error: z.string().min(1) }),
]);

export const handleGoogleCallbackDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("success"),
    code: z.string().min(1),
  }),
  z.object({
    type: z.literal("error"),
    error: z.string().min(1),
  }),
]);

export const handleGoogleLinkingCallbackDto = handleGoogleCallbackDto;

export const StateQueryParamSchema = z.object({
  state: z.url(),
});

export const RedirectToGoogleDto = StateQueryParamSchema.extend({
  callback: z.url().optional(),
});

export const RedirectToGoogleForLinkingDto = StateQueryParamSchema;

export const GoogleUserSchema = z.object({
  id: z.string().min(1),
  email: EmailSchema,
  verified_email: z.boolean(),
  name: z.string().min(1),
  given_name: z.string().min(1),
  family_name: z.string().min(1),
  picture: z.string().min(1),
});

export type CheckAuthStatusDtoType = z.infer<typeof CheckAuthStatusDto>;

export type GetUserDtoType = z.infer<typeof GetUserDto>;

export type HandleGoogleQueryDtoType = z.infer<typeof HandleGoogleQueryDto>;

export type handleGoogleCallbackDtoType = z.infer<
  typeof handleGoogleCallbackDto
>;

export type handleGoogleLinkingCallbackDtoType = z.infer<
  typeof handleGoogleLinkingCallbackDto
> &
  UserId;

export type RedirectToGoogleDtoType = z.infer<typeof RedirectToGoogleDto>;

export type GoogleUser = z.infer<typeof GoogleUserSchema>;

export type DeleteAccountDtoType = UserId;

export type RedirectToGoogleForLinkingDtoType = z.infer<
  typeof RedirectToGoogleForLinkingDto
>;
