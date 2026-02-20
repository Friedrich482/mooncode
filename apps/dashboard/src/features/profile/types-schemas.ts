import { z } from "zod";

import { UpdateUsernameSchema } from "@repo/common/types-schemas";

export type UpdateUsernameFormSchemaType = z.infer<typeof UpdateUsernameSchema>;
