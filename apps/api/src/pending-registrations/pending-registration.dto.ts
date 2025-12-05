import z from "zod";

import { RegisterUserDto } from "@repo/common/types-schemas";

export const FindPendingRegistrationByEmailDto = RegisterUserDto.omit({
  callbackUrl: true,
});

export const DeletePendingRegistrationAfterRegistrationDto = z.object({
  email: z.email(),
});

export type FindPendingRegistrationByEmailDtoType = z.infer<
  typeof FindPendingRegistrationByEmailDto
>;

export type DeletePendingRegistrationAfterRegistrationDtoType = z.infer<
  typeof DeletePendingRegistrationAfterRegistrationDto
>;
