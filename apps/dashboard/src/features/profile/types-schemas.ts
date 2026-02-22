import { z } from "zod";

import {
  CreateEmailUpdateSchema,
  UpdateEmailSchema,
  UpdateUsernameSchema,
} from "@repo/common/types-schemas";

export const UpdateEmailFormSchema = UpdateEmailSchema.omit({ token: true });

export type UpdateUsernameFormSchemaType = z.infer<typeof UpdateUsernameSchema>;

export type CreateEmailUpdateFormSchemaType = z.infer<
  typeof CreateEmailUpdateSchema
>;
export type UpdateEmailFormSchemaType = z.infer<typeof UpdateEmailFormSchema>;
