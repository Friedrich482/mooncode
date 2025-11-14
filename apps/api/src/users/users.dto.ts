import { RegisterUserDto } from "@repo/common/types-schemas";
import { authMethodEnum } from "src/drizzle/schema/users";
import { z } from "zod";

export const createUserDto = RegisterUserDto.omit({
  callbackUrl: true,
});

export const CreateGoogleUserDto = z.object({
  username: z.string().min(1),
  email: z.email(),
  googleEmail: z.email(),
  googleId: z.string().min(1),
  profilePicture: z.string().min(1),
  authMethod: z.enum(authMethodEnum),
});

export const UpdateProfileDto = RegisterUserDto.partial();

export const FindByIdDto = z.object({
  id: z.ulid(),
});

export const FindByEmailDto = z.object({
  email: z.email(),
});

export const FindByGoogleEmailDto = z.object({
  googleEmail: z.email(),
});

export const UpdateUserDto = z.object({
  id: z.ulid(),
  email: z.email({ message: "Invalid email format" }).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  googleEmail: z.email().optional(),
  googleId: z.string().min(1).optional(),
  authMethod: z.enum(authMethodEnum).optional(),
});

export const DeleteUserDto = z.object({
  id: z.ulid(),
});

export type CreateUserDtoType = z.infer<typeof createUserDto>;

export type CreateGoogleUserDtoType = z.infer<typeof CreateGoogleUserDto>;

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

export type FindByIdDtoType = z.infer<typeof FindByIdDto>;

export type FindByEmailDtoType = z.infer<typeof FindByEmailDto>;

export type FindByGoogleEmailDtoType = z.infer<typeof FindByGoogleEmailDto>;
