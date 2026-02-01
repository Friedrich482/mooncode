import { useGetTimeSpentOnProject } from "@/hooks/projects/use-get-time-spent-on-project";
import { usePageTitle } from "@/hooks/use-page-title";

export const ProjectTitle = () => {
  const data = useGetTimeSpentOnProject();
  usePageTitle(`${data.name} | Mooncode`);

  return <h1 className="text-3xl underline">{data.name}</h1>;
};
