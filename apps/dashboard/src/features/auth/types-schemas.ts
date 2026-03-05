import { z } from "zod";

import {
  CreateEmailVerificationSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  VerifyEmailVerificationCodeSchema,
  VerifyPasswordResetCodeSchema,
} from "@repo/common/types-schemas";

export const ResetPasswordFormSchema = z
  .object({
    ...ResetPasswordSchema.shape,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  });

export const RegisterFormSchema = CreateEmailVerificationSchema.omit({
  type: true,
});

export const VerifyEmailVerificationCodeFormSchema =
  VerifyEmailVerificationCodeSchema.omit({ id: true });

export const RegisterFinishFormSchema = RegisterUserSchema.omit({
  token: true,
});

export const VerifyPasswordResetCodeFormSchema =
  VerifyPasswordResetCodeSchema.omit({ id: true });

export type ResetPasswordFormSchemaType = z.infer<
  typeof ResetPasswordFormSchema
>;

export type RegisterFormSchemaType = z.infer<typeof RegisterFormSchema>;

export type VerifyEmailVerificationCodeFormSchemaType = z.infer<
  typeof VerifyEmailVerificationCodeFormSchema
>;

export type RegisterFinishFormSchemaType = z.infer<
  typeof RegisterFinishFormSchema
>;

export type VerifyPasswordResetCodeFormSchemaType = z.infer<
  typeof VerifyPasswordResetCodeFormSchema
>;
