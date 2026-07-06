import { isDeepStrictEqual } from "node:util";

import { FileDataSync } from "@/types-schemas";

export const hasFilesDataChanged = (
  oldFilesData: FileDataSync,
  newFilesData: FileDataSync,
) => !isDeepStrictEqual(oldFilesData, newFilesData);
