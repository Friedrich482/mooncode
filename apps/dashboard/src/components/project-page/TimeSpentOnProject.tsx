import formatDuration from "@repo/common/formatDuration";
import useGetTimeSpentOnProject from "@/hooks/projects/useGetTimeSpentOnProject";

const TimeSpentOnProject = () => {
  const data = useGetTimeSpentOnProject();

  return (
    <span className="text-wrap">{formatDuration(data.totalTimeSpent)}</span>
  );
};

export default TimeSpentOnProject;
