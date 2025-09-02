import { filesData } from "@/constants";

const updateFilesDataElapsedTime = () => {
  // Update all files times
  const now = performance.now();

  Object.keys(filesData).forEach((filePath) => {
    const fileData = filesData[filePath];
    // Only use frozenTime if it is not null (0 is valid)
    fileData.elapsedTime =
      fileData.isFrozen && fileData.frozenTime !== null
        ? fileData.frozenTime
        : Math.floor((now - fileData.startTime) / 1000);
  });

  return filesData;

  return filesData;
};

export default updateFilesDataElapsedTime;
