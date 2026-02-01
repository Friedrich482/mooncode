import { useLoaderData } from "react-router";

import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { projectLoader } from "@/utils/loader/project-loader";
import { useTRPC } from "@/utils/trpc";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseQueryProjectsLangChart = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const groupBy = usePeriodStore((state) => state.groupBy);

  const trpc = useTRPC();
  const { data: pieChart } = useSuspenseQuery(
    trpc.analytics.projects.getProjectLanguagesTimeOnPeriod.queryOptions(
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

  const { data: barChartData } = useSuspenseQuery(
    trpc.analytics.projects.getProjectLanguagesPerDayOfPeriod.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            name,
            groupBy,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            name,
            groupBy,
          },
    ),
  );

  const pieChartData = pieChart.map((entry) => {
    const color = getLanguageColor(entry.languageSlug);
    return {
      ...entry,
      color,
    };
  });

  return { pieChartData, barChartData };
};
