import { PERIODS_CONFIG } from "@/constants";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import { usePeriodStore } from "@/hooks/store/periodStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const useSuspenseQueryPeriodLangChart = () => {
  const period = usePeriodStore((state) => state.period);
  const groupBy = usePeriodStore((state) => state.groupBy);
  const customRange = usePeriodStore((state) => state.customRange);

  const trpc = useTRPC();

  const { data: pieChart } = useSuspenseQuery(
    trpc.codingStats.getPeriodLanguagesTime.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
          },
    ),
  );

  const { data: barChartData } = useSuspenseQuery(
    trpc.codingStats.getPeriodLanguagesPerDay.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            groupBy: groupBy,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
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

  return {
    pieChartData,
    barChartData,
  };
};

export default useSuspenseQueryPeriodLangChart;
