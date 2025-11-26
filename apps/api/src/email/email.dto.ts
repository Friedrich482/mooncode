import z from "zod";

export const sendVerificationCodeDto = z.object({
  email: z.email(),
  //  TODO add more validation here ??
  code: z.string().min(1),
});

export type SendVerificationCodeDtoType = z.infer<
  typeof sendVerificationCodeDto
>;
