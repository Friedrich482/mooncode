import { z } from "zod";

export const ProjectParamsSchema = z.object({
  projectName: z.string().min(1),
});
