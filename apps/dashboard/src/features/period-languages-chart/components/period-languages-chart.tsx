import { useMemo, useState } from "react";
import { BarChartIcon, PieChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultTooltipContent";

import { CustomChartToolTip } from "@/components/common/custom-chart-tooltip";
import { chartConfig } from "@/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { formatTickForGroupBy } from "@/utils/format-tick-for-groupby";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { Icon } from "@repo/ui/components/ui/icon";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";

import { useSuspenseQueryPeriodLangChart } from "../hooks/use-suspense-query-period-lang-chart";

export const PeriodLanguagesChart = () => {
  const { pieChartData, barChartData } = useSuspenseQueryPeriodLangChart();

  const [isPieChartVisible, setIsPieChartVisible] = useState(true);
  const handleClick = () => setIsPieChartVisible((prev) => !prev);

  const dataSet = useMemo(
    () =>
      [...new Set(barChartData.flatMap((entry) => Object.keys(entry)))].filter(
        (key) =>
          key !== "date" && key !== "timeSpent" && key !== "originalDate",
      ),
    [barChartData],
  );

  const groupBy = usePeriodStore((state) => state.groupBy);

  // ! Don't try to refactor the two charts and put them in their own
  // ! component, it is not supported by recharts

  return (
    <div className="max-chart:w-full relative w-[45%]">
      <Icon
        Icon={isPieChartVisible ? BarChartIcon : PieChartIcon}
        className="absolute -top-12 right-0 z-0"
        onClick={handleClick}
      />
      <div className="flex min-h-96 flex-col rounded-md border">
        <h2 className="text-center text-2xl font-bold max-[18rem]:text-base">
          Languages
        </h2>
        <ChartContainer
          config={chartConfig}
          className="w-full flex-1 border-none"
        >
          {isPieChartVisible ? (
            <PieChart accessibilityLayer>
              <ChartTooltip
                labelFormatter={() => <div className="font-semibold">Time</div>}
                content={<ChartTooltipContent labelClassName="font-semibold" />}
                formatter={(
                  value: string,
                  languageSlug,
                  {
                    payload,
                  }: { payload?: { payload: (typeof pieChartData)[number] } },
                ) => {
                  if (!payload) return null;

                  const { payload: innerPayload } = payload;

                  return CustomChartToolTip(
                    parseInt(value),
                    innerPayload.color,
                    languageSlug.toString(),
                    innerPayload.percentage,
                  );
                }}
              />
              <ChartLegend
                content={
                  <ChartLegendContent
                    order="DESC"
                    className="text-xs"
                    limit={20}
                  />
                }
                className="flex-wrap justify-end pr-2 max-[30rem]:hidden"
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Pie
                data={pieChartData}
                dataKey="time"
                nameKey="languageSlug"
                className="cursor-pointer"
              >
                {pieChartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart accessibilityLayer data={barChartData}>
              <CartesianGrid vertical={false} horizontal={false} />
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
                  }: { payload?: (typeof barChartData)[number] } = payload[0];

                  if (!innerPayload) return null;

                  return <div>{innerPayload.originalDate}</div>;
                }}
                formatter={(value: string, languageSlug) =>
                  CustomChartToolTip(
                    parseInt(value),
                    getLanguageColor(languageSlug),
                    languageSlug,
                  )
                }
              />
              {dataSet.map((languageSlug) => {
                return (
                  <Bar
                    key={languageSlug}
                    dataKey={languageSlug}
                    stackId="a"
                    fill={getLanguageColor(languageSlug)}
                    className="cursor-pointer"
                  />
                );
              })}
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};
