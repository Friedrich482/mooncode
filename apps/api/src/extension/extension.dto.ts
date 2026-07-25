import { z } from "zod";

import { DateStringDto } from "@/common/dto";
import { SemVerSchema as SemVerDto, UserId } from "@repo/common/types-schemas";

export const CollectTelemetryDataDto = z.object({
  machineId: z.hash("sha256"),
  extensionVersion: SemVerDto,
  vscodeVersion: SemVerDto,
});

export const GetLanguagesTimeForDayDto = z.object({
  dateString: DateStringDto,
});

export const GetFilesForDayDto = z.discriminatedUnion("type", [
  z.object({
    dateString: DateStringDto,
    type: z.literal("old").optional().default("old"),
  }),
  z.object({
    dateString: DateStringDto,
    type: z.literal("new"),
  }),
]);

export const UpsertLanguagesDto = z.object({
  targetedDate: DateStringDto,
  timeSpentOnDay: z.number().int(),
  timeSpentPerLanguage: z.record(z.string().min(1), z.number().int()),
});

const NewExpectedFilesDataDto = z.record(
  z.string().min(1), // project path
  z.record(
    z.string().min(1), // branch name
    z.record(
      z.string().min(1), // absolute path of the file
      z.object({
        timeSpent: z.number().int().nonnegative(),
        languageSlug: z.string().min(1),
        projectName: z.string().min(1),
        fileName: z.string().min(1),
      }),
    ),
  ),
);

export const UpsertFilesDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("old").optional().default("old"),
    filesData: z.record(
      z.string().min(1),
      z.object({
        timeSpent: z.number().int().nonnegative(),
        languageSlug: z.string().min(1),
        projectName: z.string().min(1),
        projectPath: z.string().min(1),
        fileName: z.string().min(1),
        // default main for backward compatibility
        branchName: z.string().min(1).default("main"),
      }),
    ),
    targetedDate: DateStringDto,
  }),

  z.object({
    type: z.literal("new"),
    filesData: NewExpectedFilesDataDto,
    targetedDate: DateStringDto,
  }),
]);

export type CollectTelemetryDataDtoType = z.infer<
  typeof CollectTelemetryDataDto
> &
  UserId;

export type GetLanguagesTimeForDayDtoType = z.infer<
  typeof GetLanguagesTimeForDayDto
> &
  UserId;

export type NewExpectedFilesDataDtoType = z.infer<
  typeof NewExpectedFilesDataDto
>;

export type UpsertLanguagesDtoType = z.infer<typeof UpsertLanguagesDto> &
  UserId;

export type GetFilesForDayDtoType = z.infer<typeof GetFilesForDayDto> & UserId;

export type UpsertFilesDtoType = z.infer<typeof UpsertFilesDto> & UserId;
