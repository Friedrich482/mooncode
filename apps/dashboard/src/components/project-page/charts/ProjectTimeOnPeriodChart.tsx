import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  Cell,
  ComposedChart,
  Line,
  XAxis,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultTooltipContent";

import CustomChartToolTip from "@/components/common/CustomChartToolTip";
import { chartConfig, PERIODS_CONFIG } from "@/constants";
import { usePeriodStore } from "@/hooks/store/periodStore";
import { formatTickForGroupBy } from "@/utils/formatTickForGroupBy";
import projectLoader from "@/utils/loader/projectLoader";
import { RouterOutput, useTRPC } from "@/utils/trpc";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import Icon from "@repo/ui/components/ui/Icon";
import { useSuspenseQuery } from "@tanstack/react-query";

type ChartDataType = RouterOutput["filesStats"]["getProjectPerDayOfPeriod"];

const tooltipLabelFormatter = (
  _date: string,
  payload: Payload<string, string>[],
) => {
  if (payload.length === 0) return null;
  const { payload: innerPayload }: { payload?: ChartDataType[number] } =
    payload[0];

  if (!innerPayload) return null;

  return <div>{innerPayload.originalDate}</div>;
};

const tooltipFormatter = (value: string, name: string) =>
  name === "Time"
    ? CustomChartToolTip(parseInt(value), "var(--color-time)")
    : null;

const ProjectTimeOnPeriodChart = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

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

  // ! don't try to refactor, extracting the `ChartTooltip` in its own component won't work with recharts
  return (
    <div className="max-chart:w-full relative z-0 flex min-h-96 w-[45%] flex-col rounded-md border">
      <Icon
        Icon={isBarChartVisible ? AreaChartIcon : BarChartIcon}
        className="absolute -top-12 right-0 z-0"
        onClick={handleClick}
      />
      <ChartContainer
        config={chartConfig}
        className="h-full flex-1 border-none"
      >
        {isBarChartVisible ? (
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
              labelFormatter={tooltipLabelFormatter}
              formatter={tooltipFormatter}
            />
            <Bar
              dataKey="timeSpentBar"
              fill="var(--color-time)"
              className="cursor-pointer"
              name="Time"
              key={`${chartData[0].originalDate}-${chartData.at(-1)?.originalDate}`}
            >
              {chartData.map((entry) => (
                <Cell
                  min={0}
                  key={entry.originalDate}
                  className="cursor-pointer"
                />
              ))}
            </Bar>

            <Line
              dataKey="timeSpentLine"
              stroke="var(--destructive)"
              strokeWidth={2}
              dot={{ r: 4 }}
              type="monotone"
              className="cursor-pointer"
            >
              {chartData.map((entry) => (
                <Cell
                  min={0}
                  key={entry.originalDate}
                  className="cursor-pointer"
                />
              ))}
            </Line>
          </ComposedChart>
        ) : (
          <AreaChart data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => formatTickForGroupBy(value, groupBy)}
            />
            <ChartTooltip
              content={<ChartTooltipContent labelClassName="font-semibold" />}
              labelFormatter={tooltipLabelFormatter}
              formatter={tooltipFormatter}
            />
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
              key={`${chartData[0].originalDate}-${chartData.at(-1)?.originalDate}`}
            >
              {chartData.map((entry) => (
                <Cell
                  min={0}
                  key={entry.originalDate}
                  className="cursor-pointer"
                />
              ))}
            </Area>
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  );
};

export default ProjectTimeOnPeriodChart;
