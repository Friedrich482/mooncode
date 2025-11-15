import { PERIODS_CONFIG } from "@/constants";
import { usePeriodStore } from "@/hooks/store/periodStore";
import useSafeParams from "@/hooks/useSafeParams";
import { ProjectParamsSchema } from "@/types-schemas";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

const useGetTimeSpentOnProject = () => {
  const { projectName } = useSafeParams(ProjectParamsSchema);

  const trpc = useTRPC();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const { data } = useSuspenseQuery(
    trpc.filesStats.getProjectOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            name: projectName,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            name: projectName,
          },
    ),
  );

  return data;
};

export default useGetTimeSpentOnProject;
