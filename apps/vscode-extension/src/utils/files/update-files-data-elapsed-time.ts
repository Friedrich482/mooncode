import { filesData } from "@/constants";

export const updateFilesDataElapsedTime = () => {
  // Update all files times
  const now = performance.now();

  Object.keys(filesData).forEach((filePath) => {
    const fileData = filesData[filePath];

    // Only use frozenTime if it is not null (0 is valid)
    fileData.elapsedTime =
      // we check if the file is in a frozen state or not
      fileData.isFrozen && fileData.frozenTime !== null
        ? fileData.frozenTime
        : Math.floor((now - fileData.startTime) / 1000);
  });

  return filesData;
};
