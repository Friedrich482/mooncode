import { filesData } from "@/constants";

export const deleteFilesDataContent = () => {
  Object.keys(filesData).forEach((filePath) => {
    delete filesData[filePath];
  });
};
