import { useGetTimeSpentOnProject } from "@/hooks/projects/use-get-time-spent-on-project";
import { formatDuration } from "@repo/common/format-duration";

export const TimeSpentOnProject = () => {
  const data = useGetTimeSpentOnProject();

  return (
    <span className="text-wrap">{formatDuration(data.totalTimeSpent)}</span>
  );
};
