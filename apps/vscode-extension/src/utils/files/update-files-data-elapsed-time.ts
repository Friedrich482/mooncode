import { filesData } from "@/constants";

export const updateFilesDataElapsedTime = () => {
  // Update all files times
  const now = performance.now();

  Object.entries(filesData).forEach(([, branches]) => {
    Object.entries(branches).forEach(([, files]) => {
      Object.entries(files).forEach(([, file]) => {
        // Only use frozenTime if it is not null (0 is valid)
        file.elapsedTime =
          // we check if the file is in a frozen state or not
          file.isFrozen && file.frozenTime !== null
            ? file.frozenTime
            : Math.floor((now - file.startTime) / 1000);
      });
    });
  });

  return filesData;
};
