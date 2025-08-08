import { Area, Bar, ComposedChart, Line, XAxis } from "recharts";
import { AreaChart, BarChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { PERIODS_CONFIG, chartConfig } from "@/constants";
import CustomChartToolTip from "@/components/CustomChartToolTip";
import Icon from "@repo/ui/components/ui/Icon";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { ProjectParamsSchema } from "@/types-schemas";
import { formatTickForGroupBy } from "@/utils/formatTickForGroupBy";
import { usePeriodStore } from "@/hooks/store/periodStore";
import useSafeParams from "@/hooks/useSafeParams";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const ProjectTimeOnPeriodChart = () => {
  const { projectName: name } = useSafeParams(ProjectParamsSchema);

  const period = usePeriodStore((state) => state.period);
  const groupBy = usePeriodStore((state) => state.groupBy);
  const customRange = usePeriodStore((state) => state.customRange);

  const [isBarChartVisible, setIsBarChartVisible] = useState(true);
  const handleClick = () => setIsBarChartVisible((prev) => !prev);

  const trpc = useTRPC();

  const { data: chartData } = useSuspenseQuery(
    trpc.filesStats.getProjectPerDayOfPeriod.queryOptions(
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

  return (
    <div className="max-chart:w-full relative z-0 flex min-h-96 w-[45%] flex-col rounded-md border">
      <Icon
        Icon={isBarChartVisible ? AreaChart : BarChart}
        className="absolute -top-12 right-0 z-0"
        onClick={handleClick}
      />
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
          {isBarChartVisible ? (
            <>
              <Bar
                dataKey="timeSpentBar"
                fill="var(--color-time)"
                className="cursor-pointer"
                name="Time"
              />

              <Line
                dataKey="timeSpentLine"
                stroke="var(--destructive)"
                strokeWidth={2}
                dot={{ r: 4 }}
                type="monotone"
                className="cursor-pointer"
              />
            </>
          ) : (
            <Area
              dataKey="timeSpentArea"
              fill="var(--color-time)"
              className="cursor-pointer"
              name="Time"
              stroke="var(--destructive)"
              strokeWidth={2}
              type="monotone"
              fillOpacity={1}
              dot={{ r: 4 }}
            />
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default ProjectTimeOnPeriodChart;
