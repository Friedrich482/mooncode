import z from "zod";

import { SemVerDto } from "@/common/dto";

export const CreateTelemetryDto = z.object({
  machineId: z.string().min(1),
  extensionVersion: SemVerDto,
  vscodeVersion: SemVerDto,
  userId: z.ulid(),
});

export const FindTelemetryDto = z.object({
  machineId: z.string().min(1),
  userId: z.ulid(),
});

export type CreateTelemetryDtoType = z.infer<typeof CreateTelemetryDto>;

export type FindTelemetryDtoType = z.infer<typeof FindTelemetryDto>;
