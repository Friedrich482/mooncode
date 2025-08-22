import { z } from "zod";

export const HandleGoogleCallBacKDto = z.object({
  code: z.string().min(1),
});

export type HandleGoogleCallBacKDtoType = z.infer<
  typeof HandleGoogleCallBacKDto
>;
