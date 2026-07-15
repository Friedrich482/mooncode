import { useMemo } from "react";
import { useLoaderData } from "react-router";

import { projectLoader } from "@/loaders/project-loader";
import { useBranchesStore } from "@/stores/branches/branches-store";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { getLocaleDate } from "@repo/common/get-locale-date";
import { cn } from "@repo/ui/lib/utils";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";
import { getLanguageName } from "@repo/ui/utils/get-language-name";
import { useSuspenseQuery } from "@tanstack/react-query";

const StatWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-1/2 flex-col justify-center gap-1 rounded-md border px-2 text-center max-[28.125rem]:min-w-full max-[28.125rem]:py-2">
    {children}
  </div>
);
const TwoStatsWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex min-h-36 flex-row gap-4 text-xl max-[28.125rem]:flex-col max-[28.125rem]:pt-4 max-[28.125rem]:text-base",
      className,
    )}
  >
    {children}
  </div>
);
export const ProjectGeneralStatsChart = () => {
  const period = usePeriodStore((state) => state.period);
  const groupBy = usePeriodStore((state) => state.groupBy);
  const customRange = usePeriodStore((state) => state.customRange);
  const branches = useBranchesStore((state) => state.branches);

  const todaysDateString = useMemo(() => getLocaleDate(new Date()), []);
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.projects.getPeriodGeneralStatsForProject.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            todaysDateString,
            name,
            groupBy,
            branches,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            todaysDateString,
            name,
            groupBy,
            branches,
          },
    ),
  );

  const { avgTime, percentageToAvg, mostActiveDate, mostUsedLanguageSlug } =
    data;
  const mostUsedLanguageColor = getLanguageColor(mostUsedLanguageSlug);
  const mostUsedLanguageName = getLanguageName(mostUsedLanguageSlug);

  return (
    <div className="max-chart:w-full flex min-h-96 w-[45%] flex-col gap-y-3 rounded-md border p-3 text-2xl max-[28.125rem]:justify-between max-[28.125rem]:gap-0">
      <h2 className="text-center text-2xl font-bold">Project General stats</h2>

      <TwoStatsWrapper>
        <StatWrapper>
          <p>Average time per {groupBy?.slice(0, -1)}</p>
          <p className="text-primary/85 font-bold">{avgTime}</p>
        </StatWrapper>

        <StatWrapper>
          <p>Percentage to the average</p>
          <p
            className={cn(
              "font-bold",
              percentageToAvg >= 0 && "text-green-600",
              percentageToAvg < 0 && "text-destructive",
            )}
          >
            {percentageToAvg < 0 ? percentageToAvg : `+${percentageToAvg}`}%
          </p>
        </StatWrapper>
      </TwoStatsWrapper>

      <TwoStatsWrapper>
        <StatWrapper>
          <p>Most active {groupBy?.slice(0, -1)}</p>
          <p className="text-primary/85 font-bold">{mostActiveDate}</p>
        </StatWrapper>

        <StatWrapper>
          <p>Most used language</p>
          <div className="flex items-center justify-center gap-2">
            <div
              className="size-5 shrink-0 rounded-xs max-sm:size-3"
              style={{
                backgroundColor: mostUsedLanguageColor,
              }}
            />
            <p className="text-primary/85 font-bold wrap-anywhere">
              {mostUsedLanguageName}
            </p>
          </div>
        </StatWrapper>
      </TwoStatsWrapper>
    </div>
  );
};
