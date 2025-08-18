import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `MoonCode | ${title}`;
  }, []);
};

export default usePageTitle;
