import { PERIODS_CONFIG } from "@/constants";
import { usePeriodStore } from "@/hooks/store/period-store";
import { useTRPC } from "@/utils/trpc";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseQueryPeriodLangChart = () => {
  const period = usePeriodStore((state) => state.period);
  const groupBy = usePeriodStore((state) => state.groupBy);
  const customRange = usePeriodStore((state) => state.customRange);

  const trpc = useTRPC();

  const { data: pieChart } = useSuspenseQuery(
    trpc.analytics.general.getPeriodLanguagesTime.queryOptions(
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
    trpc.analytics.general.getPeriodLanguagesPerDay.queryOptions(
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
