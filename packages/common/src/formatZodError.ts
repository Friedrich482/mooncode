import { z, ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  return z.prettifyError(error);
};
