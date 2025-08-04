import { ZodError, z } from "zod";

export const formatZodError = (error: ZodError) => {
  return z.prettifyError(error);
};
