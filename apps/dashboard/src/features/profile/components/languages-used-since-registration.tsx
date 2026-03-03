import { useMemo } from "react";
import { Check } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { CustomChartToolTip } from "@/components/common/custom-chart-tooltip";
import { chartConfig } from "@/constants";
import { useTRPC } from "@/utils/trpc";
import { DATE_LOCALE } from "@repo/common/constants";
import { getTodaysLocaleDate } from "@repo/common/get-todays-locale-date";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";
import { getLanguageName } from "@repo/ui/utils/get-language-name";
import { useSuspenseQuery } from "@tanstack/react-query";

export const LanguagesUsedSinceRegistration = () => {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  const { data } = useSuspenseQuery(
    trpc.analytics.general.getPeriodLanguagesTime.queryOptions({
      start: user.registrationDate.toLocaleDateString(DATE_LOCALE),
      end: getTodaysLocaleDate(),
    }),
  );

  const chartData = useMemo(
    () =>
      [...data].reverse().map((entry) => ({
        ...entry,
        color: getLanguageColor(entry.languageSlug),
        languageName: getLanguageName(entry.languageSlug),
      })),
    [data],
  );

  return (
    <div className="flex w-[98%] flex-col gap-4 place-self-center rounded-md border p-4">
      <p className="space-x-4 text-xl">
        <Check className="text-secondary-foreground/80 inline shrink-0" />
        <span>
          Languages used since the{" "}
          <span className="text-primary font-bold">
            {user.registrationDate.toDateString()}
          </span>{" "}
          (your registration date)
        </span>
      </p>

      <ChartContainer
        config={chartConfig}
        className="min-h-600 w-full max-w-110 overflow-x-hidden border-none max-[48rem]:max-w-120 max-sm:max-w-75 max-[28rem]:max-w-50 max-[24rem]:max-w-35"
      >
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ left: 30 }}
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
          <XAxis dataKey="time" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelClassName="font-semibold" />}
            labelFormatter={() => (
              <div className="font-semibold">
                <span className="text-primary/85">
                  {user.registrationDate.toLocaleDateString(DATE_LOCALE)}
                </span>{" "}
                -{" "}
                <span className="text-primary/85">{getTodaysLocaleDate()}</span>
              </div>
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

          <Bar dataKey="time" layout="vertical" radius={5}>
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
    </div>
  );
};
