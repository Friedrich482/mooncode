import { IsoDateStringSchema, JWTDto } from "@repo/common/schemas";
import z from "zod";

export type FileData = {
  elapsedTime: number;
  startTime: number;
  lastActivityTime: number;
  frozenTime: number | null; // this is an accumulator of time to track the elapsedTime when the language is frozen
  freezeStartTime: number | null;
  isFrozen: boolean;
  projectName: string;
  projectPath: string;
  languageSlug: string;
  fileName: string;
};

export const globalStateInitialDataSchema = z.object({
  lastServerSync: z.union([
    z.date(),
    z.iso.datetime().transform((str) => new Date(str)),
  ]),
  dailyData: z.record(
    IsoDateStringSchema, // the localDateString of the day
    z.object({
      timeSpentOnDay: z.number(),
      timeSpentPerLanguage: z.record(z.string().min(1), z.number()),

      dayFilesData: z.record(
        z.string().min(1), // the absolute path of the file
        z.object({
          timeSpent: z.number(),
          projectPath: z.string().min(1),
          languageSlug: z.string().min(1),
          projectName: z.string().min(1),
          fileName: z.string().min(1),
        }),
      ),

      updatedAt: z.union([
        z.date(),
        z.iso.datetime().transform((str) => new Date(str)),
      ]),
    }),
  ),
});
export type FileMap = Record<string, FileData>;
export type GlobalStateData = z.infer<typeof globalStateInitialDataSchema>;
export type FileDataSync = GlobalStateData["dailyData"][string]["dayFilesData"];
export type JwtPayloadType = z.infer<typeof JWTDto>;
