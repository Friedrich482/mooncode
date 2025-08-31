import { filesData } from "@/constants";

const updateFilesDataElapsedTime = () => {
  // Update all files times
  Object.keys(filesData).forEach((file) => {
    const fileData = filesData[file];
    const now = performance.now();

    fileData.elapsedTime =
      fileData.isFrozen && fileData.frozenTime
        ? fileData.frozenTime
        : Math.floor((now - fileData.startTime) / 1000);
  });

  return filesData;
};

export default updateFilesDataElapsedTime;
