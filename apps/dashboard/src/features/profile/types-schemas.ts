import { z } from "zod";

import { UpdateUsernameSchema } from "@repo/common/types-schemas";

export const UpdateUsernameFormSchema = UpdateUsernameSchema.omit({
  email: true,
});

export type UpdateUsernameFormSchemaType = z.infer<
  typeof UpdateUsernameFormSchema
>;
