import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { useMemo, useState } from "react";
import ChartTitle from "./ChartTitle";
import CustomChartToolTip from "@/components/CustomChartToolTip";
import { DATE_LOCALE } from "@repo/common/constants";
import { chartConfig } from "@/constants";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import getNextDayDate from "@/utils/getNextDayDate";
import getPrevDayDate from "@/utils/getPreviousDayDate";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const DayLanguagesChart = () => {
  const [date, setDate] = useState(new Date());
  const dateString = useMemo(
    () => date.toLocaleDateString(DATE_LOCALE),
    [date],
  );

  const handleChevronLeftClick = () => setDate((prev) => getPrevDayDate(prev));
  const handleChevronRightClick = () => setDate((prev) => getNextDayDate(prev));

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.codingStats.getDailyStatsForChart.queryOptions({
      dateString,
    }),
  );

  const { finalData, formattedTotalTimeSpent, dateLabel: displayDate } = data;

  const chartData = finalData.map((entry) => ({
    ...entry,
    color: getLanguageColor(entry.languageSlug),
    languageName: getLanguageName(entry.languageSlug),
  }));

  return (
    <div className="flex min-h-96 w-[45%] flex-col gap-y-2 rounded-md border py-2 max-chart:w-full">
      <ChartTitle
        displayDate={displayDate}
        formattedTotalTimeSpent={formattedTotalTimeSpent}
        handleChevronLeftClick={handleChevronLeftClick}
        handleChevronRightClick={handleChevronRightClick}
        date={date}
        setDate={setDate}
      />{" "}
      {chartData.length === 0 ? (
        <p className="w-full pt-[25%] text-center text-2xl">
          No coding stats for the day
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="w-full flex-1 border-none"
        >
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ left: 20 }}
            accessibilityLayer
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="languageName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="timeSpent" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelClassName="font-semibold" />}
              labelFormatter={() => (
                <div className="font-semibold">{displayDate}</div>
              )}
              formatter={(
                value: number,
                _,
                { payload }: { payload?: (typeof chartData)[number] },
              ) => {
                if (!payload) return null;

                return CustomChartToolTip(
                  value,
                  payload.color,
                  payload.languageSlug,
                  payload.percentage,
                );
              }}
            />
            <Bar dataKey="timeSpent" layout="vertical" radius={5}>
              {chartData.map((entry) => (
                <Cell
                  fill={entry.color}
                  min={0}
                  key={entry.languageSlug}
                  className="cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default DayLanguagesChart;
