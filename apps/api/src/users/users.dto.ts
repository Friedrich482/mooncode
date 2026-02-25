import { z } from "zod";
import { authMethodEnum } from "src/drizzle/schema/users";

import { PasswordSchema } from "@repo/common/types-schemas";

export const CreateUserDto = z.object({
  email: z.email(),
  password: PasswordSchema,
  username: z.string().min(3, "Username must be at least 3 characters"),
  emailVerifiedAt: z.date(),
});

export const CreateGoogleUserDto = z.object({
  username: z.string().min(1),
  email: z.email(),
  googleEmail: z.email(),
  googleId: z.string().min(1),
  profilePicture: z.url(),
  authMethod: z.enum(authMethodEnum),
});

export const FindByIdDto = z.object({
  id: z.ulid(),
});

export const FindByEmailDto = z.object({
  email: z.email(),
});

export const FindByUsernameDto = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const FindByGoogleEmailDto = z.object({
  googleEmail: z.email(),
});

export const UpdateUserDto = z.object({
  id: z.ulid(),
  email: z.email({ message: "Invalid email format" }).optional(),
  password: PasswordSchema.optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  googleEmail: z.email().optional(),
  googleId: z.string().min(1).optional(),
  authMethod: z.enum(authMethodEnum).optional(),
  profilePicture: z.url().optional(),
});

export const DeleteUserDto = z.object({
  id: z.ulid(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

export type CreateGoogleUserDtoType = z.infer<typeof CreateGoogleUserDto>;

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

export type FindByIdDtoType = z.infer<typeof FindByIdDto>;

export type FindByEmailDtoType = z.infer<typeof FindByEmailDto>;

export type FindByUsernameDtoType = z.infer<typeof FindByUsernameDto>;

export type FindByGoogleEmailDtoType = z.infer<typeof FindByGoogleEmailDto>;
