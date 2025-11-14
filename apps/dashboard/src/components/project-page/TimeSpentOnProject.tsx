import useGetTimeSpentOnProject from "@/hooks/projects/useGetTimeSpentOnProject";
import formatDuration from "@repo/common/formatDuration";

const TimeSpentOnProject = () => {
  const data = useGetTimeSpentOnProject();

  return (
    <span className="text-wrap">{formatDuration(data.totalTimeSpent)}</span>
  );
};

export default TimeSpentOnProject;
