import useGetTimeSpentOnProject from "@/hooks/projects/useGetTimeSpentOnProject";
import usePageTitle from "@/hooks/usePageTitle";

const ProjectTitle = () => {
  const data = useGetTimeSpentOnProject();
  usePageTitle(`${data.name} | Mooncode`);

  return <h1 className="text-3xl underline">{data.name}</h1>;
};

export default ProjectTitle;
