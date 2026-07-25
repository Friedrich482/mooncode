import z from "zod";

import { SemVerSchema as SemVerDto } from "@repo/common/types-schemas";

export const CreateTelemetryDto = z.object({
  machineId: z.hash("sha256"),
  extensionVersion: SemVerDto,
  vscodeVersion: SemVerDto,
  userId: z.ulid(),
});

export const FindTelemetryDto = z.object({
  machineId: z.hash("sha256"),
  userId: z.ulid(),
});

export type CreateTelemetryDtoType = z.infer<typeof CreateTelemetryDto>;

export type FindTelemetryDtoType = z.infer<typeof FindTelemetryDto>;
