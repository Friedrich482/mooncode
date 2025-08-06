import useGetTimeSpentOnProject from "@/hooks/projects/useGetTimeSpentOnProject";

const ProjectTitle = () => {
  const data = useGetTimeSpentOnProject();

  return <h1 className="text-3xl underline">{data.name}</h1>;
};

export default ProjectTitle;
