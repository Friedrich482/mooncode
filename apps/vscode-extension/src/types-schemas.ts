import { z } from "zod";

import { IsoDateStringSchema } from "@repo/common/types-schemas";

/**
 * A file is marked as frozen when it is no longer the active file or if it is the active file but the user is inactive in the file for more than `MAX_IDLE_TIME` seconds
 * - `frozenTime` is an accumulator of time to track the elapsedTime on a file when the language is frozen
 * - `freezeStartTime` is the moment when the file is marked as frozen
 * - `startTime` is the moment we start counting the time for that file
 * - `lastActivityTime` is the moment when the file is no longer focused, i.e no longer the active file
 * - `elapsedTime` is the time elapsed in total and what we send to the server/save in the global state
 * - `isFrozen` is a boolean to freeze/unfreeze the file
 */
export type FileData = {
  elapsedTime: number;
  startTime: number;
  lastActivityTime: number;
  frozenTime: number | null;
  freezeStartTime: number | null;
  isFrozen: boolean;
  projectName: string;
  projectPath: string;
  languageSlug: string;
  fileName: string;
  branchName: string;
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
          branchName: z.string().min(1),
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

export type DashboardServer = {
  port: number;
  navigate: (path: string) => void;
  isWindowOpen: () => boolean;
  close: () => void;
};
