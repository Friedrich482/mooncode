import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Folder,
  FolderOpen,
  LayoutGrid,
  List,
} from "lucide-react";

import { LinkWithQuery } from "@/components/common/link-with-query";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { formatDuration } from "@repo/common/format-duration";
import { Icon } from "@repo/ui/components/ui/icon";
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

export const PeriodProjects = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const [page, setPage] = useState(1);
  const handlePreviousPageButtonClick = () => setPage((prev) => prev - 1);
  const handleNextPageButtonClick = () => setPage((prev) => prev + 1);
  const handleGoBackToFirstPageButtonClick = () => setPage(1);

  // Reset page when period or date range changes
  useEffect(() => {
    setPage(1);
  }, [period, customRange.start, customRange.end]);

  const {
    data: { periodProjects: data, hasNext },
  } = useSuspenseQuery(
    trpc.analytics.projects.getPeriodProjects.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            page,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            page,
          },
    ),
  );

  const [isGridLayout, setIsGridLayout] = useState(true);
  const handleGridLayoutButtonClick = () => setIsGridLayout(true);
  const handleListLayoutButtonClick = () => setIsGridLayout(false);

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <section className="flex items-center justify-center gap-2 pr-4 max-[24rem]:flex-col">
        <h2 className="flex-1 text-center text-2xl font-bold max-[18rem]:text-xl">
          Projects
        </h2>
        <div className="flex gap-2">
          <Icon
            Icon={LayoutGrid}
            onClick={handleGridLayoutButtonClick}
            className={cn(
              isGridLayout &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary",
            )}
          />
          <Icon
            Icon={List}
            onClick={handleListLayoutButtonClick}
            className={cn(
              !isGridLayout &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary",
            )}
          />
        </div>
      </section>

      {data.length === 0 ? (
        <p className="text-center text-xl">
          No projects found{" "}
          {period === "Custom Range" ? (
            <>
              between{" "}
              <span className="text-primary/85">{customRange.start}</span> and{" "}
              <span className="text-primary/85">{customRange.end}</span>
            </>
          ) : (
            `on ${period.toLowerCase()}`
          )}
        </p>
      ) : isGridLayout ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 max-[42rem]:grid-cols-1 max-[42rem]:gap-8">
          {data.map((entry) => (
            <LinkWithQuery key={entry.path} to={`/dashboard/${entry.name}`}>
              <div className="group hover:border-primary/85 relative flex min-h-40 origin-bottom-right cursor-pointer flex-col items-center justify-center gap-4 rounded-md border p-3 transition-transform duration-150">
                <Icon
                  Icon={Folder}
                  className="text-border absolute -top-8 left-0 block group-hover:hidden hover:bg-transparent"
                />
                <Icon
                  Icon={FolderOpen}
                  className="group-hover:text-primary/85 absolute -top-8 left-0 hidden group-hover:block hover:bg-transparent!"
                />
                <h3 className="font-bold wrap-anywhere group-hover:underline max-[42rem]:text-xl">
                  {entry.name}
                </h3>
                <p className="text-primary/85 text-xl transition duration-150 max-[42rem]:text-base">
                  {formatDuration(entry.totalTimeSpent)} ({entry.percentage}%)
                </p>
              </div>
            </LinkWithQuery>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {data.map((entry) => (
            <LinkWithQuery
              key={entry.path}
              to={`/dashboard/${entry.name}`}
              className="group hover:border-primary/85 relative flex items-center justify-center gap-4 rounded-md border p-2"
            >
              <h3 className="font-bold group-hover:underline max-[42rem]:text-xl">
                {entry.name}
              </h3>
              <p className="text-primary/85 text-xl transition duration-150 max-[42rem]:text-base">
                {formatDuration(entry.totalTimeSpent)} ({entry.percentage}%)
              </p>
            </LinkWithQuery>
          ))}
        </div>
      )}

      {/* Pagination buttons */}
      <section className="mt-auto flex items-center justify-end gap-2">
        {page !== 1 && (
          <Icon
            Icon={ChevronsLeft}
            onClick={handleGoBackToFirstPageButtonClick}
            title="Go back to first Page"
          />
        )}
        <Icon
          Icon={ChevronLeft}
          onClick={handlePreviousPageButtonClick}
          disabled={page === 1}
          title="Previous Page"
          className="disabled:cursor-not-allowed"
        />
        <Icon
          Icon={ChevronRight}
          onClick={handleNextPageButtonClick}
          disabled={!hasNext}
          title="Next Page"
          className="disabled:cursor-not-allowed"
        />
      </section>
    </div>
  );
};
