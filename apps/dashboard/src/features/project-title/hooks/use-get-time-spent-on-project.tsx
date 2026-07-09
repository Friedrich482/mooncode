import { useLoaderData } from "react-router";

import { projectLoader } from "@/loaders/project-loader";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetTimeSpentOnProject = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const trpc = useTRPC();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const { data } = useSuspenseQuery(
    trpc.analytics.projects.getProjectOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            name,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            name,
          },
    ),
  );

  return data;
};
