import { z } from "zod";

import { authMethodEnum } from "@/drizzle/schema/users";
import {
  EmailSchema as EmailDto,
  PasswordSchema as PasswordDto,
  UsernameSchema as UsernameDto,
} from "@repo/common/types-schemas";

export const CreateUserDto = z.object({
  email: EmailDto,
  password: PasswordDto,
  username: UsernameDto,
  emailVerifiedAt: z.date(),
});

export const CreateGoogleUserDto = z.object({
  username: z.string().min(1),
  email: EmailDto,
  googleEmail: EmailDto,
  googleId: z.string().min(1),
  profilePicture: z.url(),
});

export const FindByIdDto = z.object({
  id: z.ulid(),
});

export const FindByEmailDto = z.object({
  email: EmailDto,
});

export const FindByUsernameDto = z.object({
  username: UsernameDto,
});

export const FindByGoogleEmailDto = z.object({
  googleEmail: EmailDto,
});

export const UpdateUserDto = z.object({
  id: z.ulid(),
  email: EmailDto.optional(),
  password: PasswordDto.optional(),
  username: UsernameDto.optional(),
  googleEmail: EmailDto.optional(),
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

export type DeleteUserDtoType = z.infer<typeof DeleteUserDto>;
