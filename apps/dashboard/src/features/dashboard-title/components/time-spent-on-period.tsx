import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export const TimeSpentOnPeriod = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.general.getTimeSpentOnPeriod.queryOptions(
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

  return <span className="text-pretty">{data.formattedTime}</span>;
};
