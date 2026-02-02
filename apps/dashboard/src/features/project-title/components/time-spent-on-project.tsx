import { formatDuration } from "@repo/common/format-duration";

import { useGetTimeSpentOnProject } from "../hooks/use-get-time-spent-on-project";

export const TimeSpentOnProject = () => {
  const data = useGetTimeSpentOnProject();

  return (
    <span className="text-wrap">{formatDuration(data.totalTimeSpent)}</span>
  );
};
