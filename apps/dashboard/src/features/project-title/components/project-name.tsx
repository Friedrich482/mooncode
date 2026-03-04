import { usePageTitle } from "@/hooks/use-page-title";

import { useGetTimeSpentOnProject } from "../hooks/use-get-time-spent-on-project";

export const ProjectName = () => {
  const data = useGetTimeSpentOnProject();

  usePageTitle(`${data.name} | MoonCode`);

  return <h1 className="text-3xl underline">{data.name}</h1>;
};
