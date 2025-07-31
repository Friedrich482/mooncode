import { PERIODS_CONFIG } from "@/constants";
import { ProjectParamsSchema } from "@/types-schemas";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import { usePeriodStore } from "@/hooks/store/periodStore";
import useSafeParams from "@/hooks/useSafeParams";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const useSuspenseQueryProjectsLangChart = () => {
  const { projectName: name } = useSafeParams(ProjectParamsSchema);

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const groupBy = usePeriodStore((state) => state.groupBy);

  const trpc = useTRPC();
  const { data: pieChart } = useSuspenseQuery(
    trpc.filesStats.getProjectLanguagesTimeOnPeriod.queryOptions(
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
    trpc.filesStats.getProjectLanguagesPerDayOfPeriod.queryOptions(
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

export default useSuspenseQueryProjectsLangChart;
