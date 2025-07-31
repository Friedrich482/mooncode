import { Bar, ComposedChart, Line, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { PERIODS_CONFIG, chartConfig } from "@/constants";
import CustomChartToolTip from "@/components/CustomChartToolTip";
import GroupByDropDown from "../GroupByDropDown";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatTickForGroupBy } from "@/utils/formatTickForGroupBy";
import { usePeriodStore } from "@/hooks/store/periodStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const PeriodTimeChart = () => {
  const period = usePeriodStore((state) => state.period);
  const groupBy = usePeriodStore((state) => state.groupBy);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const { data: chartData } = useSuspenseQuery(
    trpc.codingStats.getDaysOfPeriodStats.queryOptions(
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

  return (
    <div className="relative z-0 flex min-h-96 w-[45%] flex-col rounded-md border max-chart:w-full">
      <GroupByDropDown />
      <ChartContainer
        config={chartConfig}
        className="h-full flex-1 border-none"
      >
        <ComposedChart data={chartData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => formatTickForGroupBy(value, groupBy)}
          />
          <ChartTooltip
            content={<ChartTooltipContent labelClassName="font-semibold" />}
            labelFormatter={(
              _date: string,
              payload: Payload<string, string>[],
            ) => {
              if (payload.length === 0) return null;

              const {
                payload: innerPayload,
              }: { payload?: (typeof chartData)[number] } = payload[0];

              if (!innerPayload) return null;

              return <div>{innerPayload.originalDate}</div>;
            }}
            formatter={(value: string, name) =>
              name === "Time"
                ? CustomChartToolTip(parseInt(value), "var(--color-time)")
                : null
            }
          />

          <Bar
            dataKey="timeSpentBar"
            fill="var(--color-time)"
            className="cursor-pointer"
            name="Time"
          />

          <Line
            dataKey="timeSpentLine"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 4 }}
            type="monotone"
            className="cursor-pointer"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default PeriodTimeChart;
