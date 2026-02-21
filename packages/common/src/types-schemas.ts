import z from "zod";

import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  EXTENSION_ID,
  PASSWORD_RESET_CODE_LENGTH,
  PUBLISHER,
} from "./constants";

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const VSCodeCallbackUrlSchema = z
  .url()
  .startsWith("vscode://")
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const [publisher] = url.hostname.split(".");
      return publisher === PUBLISHER;
    },
    { error: "Invalid publisher", abort: true },
  )
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const [, extensionId] = url.hostname.split(".");
      return extensionId === EXTENSION_ID;
    },
    { error: "Invalid extension id", abort: true },
  )
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const state = url.searchParams.get("state");

      return state;
    },
    { error: "State parameter is required" },
  );

export const JwtPayloadSchema = z.object({
  sub: z.ulid(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export const SignInUserSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
  callbackUrl: VSCodeCallbackUrlSchema.nullable(),
});

export const CreateEmailVerificationSchema = z.object({
  email: z.email(),
});

export const VerifyEmailVerificationCodeSchema = z.object({
  id: z.ulid(),
  code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
});

export const RegisterUserSchema = z.object({
  token: z.ulid(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: PasswordSchema,
});

export const CreatePasswordResetSchema = z.object({
  email: z.email(),
});

export const VerifyPasswordResetCodeSchema = z.object({
  id: z.ulid(),
  code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
});

export const ResetPasswordSchema = z.object({
  token: z.ulid(),
  newPassword: PasswordSchema,
});

export const UpdateUsernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const IsoDateStringSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    "Date must be in YYYY-MM-DD format",
  )
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      const [year, month, day] = dateStr.split("-").map(Number);

      return (
        date instanceof Date &&
        !isNaN(date.getTime()) &&
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day
      );
    },
    { error: "Invalid date" },
  );

export const IsoDateSchema = IsoDateStringSchema.transform(
  (dateStr) => new Date(dateStr),
);

export const WsDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ready"),
  }),
  z.object({
    type: z.literal("closed"),
  }),
  z.object({
    type: z.literal("navigate"),
    path: z.string().min(1),
  }),
  z.object({
    type: z.literal("navigated"),
    path: z.string().min(1),
  }),
]);

export const GroupByEnum = ["days", "weeks", "months"] as const;
export type GroupBy = (typeof GroupByEnum)[number];
export type UserId = { userId: string };

export type PeriodResolution = "day" | "week" | "month" | "year";

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type SignInUser = z.infer<typeof SignInUserSchema>;
export type CreateEmailVerification = z.infer<
  typeof CreateEmailVerificationSchema
>;
export type VerifyEmailVerificationCode = z.infer<
  typeof VerifyEmailVerificationCodeSchema
>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type CreatePasswordReset = z.infer<typeof CreatePasswordResetSchema>;
export type VerifyPasswordResetCode = z.infer<
  typeof VerifyPasswordResetCodeSchema
>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type UpdateUsername = z.infer<typeof UpdateUsernameSchema> & UserId;
export type WsData = z.infer<typeof WsDataSchema>;
