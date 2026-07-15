import { filesData } from "@/constants";

export const deleteFilesDataContent = () => {
  Object.keys(filesData).forEach((projectPath) => {
    delete filesData[projectPath];
  });
};
