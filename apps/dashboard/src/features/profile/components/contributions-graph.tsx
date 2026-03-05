import { CSSProperties, forwardRef, useMemo } from "react";
import { subDays } from "date-fns";
import { Check } from "lucide-react";

import { RouterOutput, useTRPC } from "@/utils/trpc";
import { formatDuration } from "@repo/common/format-duration";
import { getLocaleDate } from "@repo/common/get-locale-date";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

const StreakComponentUnit = forwardRef<
  HTMLDivElement,
  {
    entry: RouterOutput["analytics"]["general"]["getDaysOfPeriodStats"][number];
    timeMaxPerDay: number;
    style?: CSSProperties;
  }
>(({ entry, timeMaxPerDay, ...props }, ref) => (
  <div
    key={entry.originalDate}
    className={cn(
      "bg-primary size-3 rounded-xs hover:scale-115",
      entry.timeSpentLine === 0 && "bg-muted/35",
    )}
    style={{
      opacity:
        entry.timeSpentLine === 0
          ? 1
          : timeMaxPerDay !== 0
            ? Math.max(
                parseFloat((entry.timeSpentLine / timeMaxPerDay).toFixed(2)),
                0.05,
              )
            : 0,
      ...props.style,
    }}
    ref={ref}
    {...props}
  />
));

export const ContributionsGraph = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.general.getDaysOfPeriodStats.queryOptions({
      start: getLocaleDate(subDays(new Date(), 364)),
      end: getLocaleDate(new Date()),
    }),
  );

  const totalTimeSpentCoding = useMemo(
    () =>
      data
        .map((entry) => entry.timeSpentLine)
        .reduce((acc, curr) => acc + curr, 0),
    [data],
  );

  const timeMaxPerDay = useMemo(
    () => data.reduce((max, entry) => Math.max(max, entry.timeSpentLine), 0),
    [data],
  );

  const firstWeek = useMemo(
    () =>
      data.slice(
        0,
        data.findIndex((entry) => entry.date === "Sunday"),
      ),
    [data],
  );
  const remainingWeeks = useMemo(
    () => data.slice(data.findIndex((entry) => entry.date === "Sunday")),
    [data],
  );

  const numberOfDaysPerMonth = useMemo(
    () =>
      data.reduce(
        (acc, curr) => {
          const monthAndYear = new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            year: "numeric",
          }).format(new Date(curr.originalDate));

          const shortMonth = new Intl.DateTimeFormat("en-US", {
            month: "short",
          }).format(new Date(curr.originalDate));

          acc[monthAndYear] = {
            numberOfDays: (acc[monthAndYear]?.numberOfDays || 0) + 1,
            shortMonth,
          };

          return acc;
        },
        {} as {
          [monthAndYear: string]: {
            numberOfDays: number;
            shortMonth: string;
          };
        },
      ),
    [data],
  );
  const maxNumberOfDaysPerMonth = useMemo(
    () =>
      data.reduce(
        (acc, curr) => {
          const shortMonth = new Intl.DateTimeFormat("en-US", {
            month: "short",
          }).format(new Date(curr.originalDate));

          acc[shortMonth] = (acc[shortMonth] || 0) + 1;
          return acc;
        },
        {} as {
          [shortMonth: string]: number;
        },
      ),
    [data],
  );
  const numberOfWeeksPerMonth = useMemo(
    () =>
      Object.entries(numberOfDaysPerMonth).map(
        ([monthAndYear, { numberOfDays, shortMonth }]) => ({
          monthAndYear,
          numberOfWeeks: numberOfDays / 7,
          shortMonth,
          numberOfDays,
        }),
      ),
    [numberOfDaysPerMonth],
  );

  return (
    <div className="flex w-[98%] flex-col justify-start gap-4 place-self-center overflow-x-scroll rounded-md border p-4">
      {/* title */}
      <p className="space-x-4 text-xl">
        <Check className="text-secondary-foreground/80 inline shrink-0" />
        <span className="text-primary">
          {formatDuration(totalTimeSpentCoding)}
        </span>{" "}
        spent coding in the last year
      </p>

      <div className="flex w-full flex-col">
        {/* months */}
        <ul className="grid w-0 grid-cols-[repeat(53,0.75rem)] gap-1 pl-6.5 text-xs">
          {numberOfWeeksPerMonth.map(
            ({ monthAndYear, shortMonth, numberOfDays }, index) => (
              <li
                key={monthAndYear}
                style={{
                  gridColumnStart: Math.round(
                    numberOfWeeksPerMonth
                      .slice(0, index)
                      .map((entry) => entry.numberOfWeeks)
                      .reduce((acc, curr) => acc + curr, 1) || 1,
                  ),
                }}
              >
                {/* don't display the first month if it has already started */}
                {index === 0 &&
                numberOfDays < maxNumberOfDaysPerMonth[shortMonth]
                  ? null
                  : shortMonth}
              </li>
            ),
          )}
        </ul>

        <div className="flex items-center gap-1">
          {/* days of the week */}
          <ul className="flex flex-col justify-center gap-4 text-xs">
            <li>Mon</li>
            <li>Wed</li>
            <li>Fri</li>
          </ul>

          <div className="flex items-center gap-4">
            {firstWeek.length !== 0 && (
              <div className="grid w-0 grid-flow-col grid-cols-[repeat(1,0.75rem)] grid-rows-[repeat(7,minmax(0,0.75rem))] gap-1">
                {firstWeek.map((entry) => (
                  <Tooltip key={entry.originalDate}>
                    <TooltipTrigger asChild>
                      <StreakComponentUnit
                        entry={entry}
                        timeMaxPerDay={timeMaxPerDay}
                        style={{
                          gridRowStart:
                            new Date(entry.originalDate).getDay() + 1,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatDuration(entry.timeSpentLine)} on{" "}
                      {entry.originalDate}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
            <div className="grid w-0 grid-flow-col grid-cols-[repeat(52,0.75rem)] grid-rows-[repeat(7,minmax(0,0.75rem))] gap-1">
              {remainingWeeks.map((entry) => (
                <Tooltip key={entry.originalDate}>
                  <TooltipTrigger asChild>
                    <StreakComponentUnit
                      entry={entry}
                      timeMaxPerDay={timeMaxPerDay}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {formatDuration(entry.timeSpentLine)} on{" "}
                    {entry.originalDate}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex w-fit translate-x-181 flex-wrap gap-3 pt-2 text-xs">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="bg-muted/35 size-3 rounded-xs" />
            <div className="bg-primary/25 size-3 rounded-xs" />
            <div className="bg-primary/50 size-3 rounded-xs" />
            <div className="bg-primary/75 size-3 rounded-xs" />
            <div className="bg-primary size-3 rounded-xs" />
          </div>
          <span>More</span>
        </footer>
      </div>
    </div>
  );
};
