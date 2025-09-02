import { filesData } from "@/constants";

const deleteFilesDataContent = () => {
  Object.keys(filesData).forEach((filePath) => {
    delete filesData[filePath];
  });
};

export default deleteFilesDataContent;
