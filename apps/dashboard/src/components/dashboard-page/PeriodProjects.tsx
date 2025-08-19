import { Folder, FolderOpen, LayoutGrid, List } from "lucide-react";
import Icon from "@repo/ui/components/ui/Icon";
import { Link } from "react-router";
import { PERIODS_CONFIG } from "@/constants";
import { cn } from "@repo/ui/lib/utils";
import formatDuration from "@repo/common/formatDuration";
import { usePeriodStore } from "@/hooks/store/periodStore";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const PeriodProjects = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.filesStats.getPeriodProjects.queryOptions(
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

  const [isGridLayout, setIsGridLayout] = useState(true);
  const handleGridLayoutButtonClick = () => setIsGridLayout(true);
  const handleListLayoutButtonClick = () => setIsGridLayout(false);

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <section className="flex items-center justify-center gap-2 pr-4">
        <h2 className="flex-1 text-center text-2xl font-bold">Projects</h2>
        <div className="space-x-2">
          <Icon
            Icon={LayoutGrid}
            onClick={handleGridLayoutButtonClick}
            className={cn(
              isGridLayout &&
                "bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground",
            )}
          />
          <Icon
            Icon={List}
            onClick={handleListLayoutButtonClick}
            className={cn(
              !isGridLayout &&
                "bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground",
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
            <Link key={entry.path} to={`/dashboard/${entry.name}`}>
              <div className="group hover:border-primary/85 relative flex min-h-40 origin-bottom-right cursor-pointer flex-col items-center justify-center gap-4 rounded-md border p-3 transition-transform duration-150">
                <Icon
                  Icon={Folder}
                  className="text-border absolute -top-8 left-0 block group-hover:hidden hover:bg-transparent"
                />
                <Icon
                  Icon={FolderOpen}
                  className="group-hover:text-primary/85 absolute -top-8 left-0 hidden group-hover:block hover:bg-transparent hover:bg-none"
                />
                <h3 className="font-bold group-hover:underline max-[42rem]:text-xl">
                  {entry.name}
                </h3>
                <p className="text-primary/85 text-xl transition duration-150 max-[42rem]:text-base">
                  {formatDuration(entry.totalTimeSpent)} ({entry.percentage}%)
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {data.map((entry) => (
            <Link
              to={`/dashboard/${entry.name}`}
              key={entry.name}
              className="group hover:border-primary/85 relative flex items-center justify-center gap-4 rounded-md border p-2"
            >
              <h3 className="font-bold group-hover:underline max-[42rem]:text-xl">
                {entry.name}
              </h3>
              <p className="text-primary/85 text-xl transition duration-150 max-[42rem]:text-base">
                {formatDuration(entry.totalTimeSpent)} ({entry.percentage}%)
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodProjects;
