import { Folder, FolderOpen } from "lucide-react";
import Icon from "@repo/ui/components/ui/Icon";
import { Link } from "react-router";
import { PERIODS_CONFIG } from "@/constants";
import formatDuration from "@repo/common/formatDuration";
import { usePeriodStore } from "@/hooks/store/periodStore";
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

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <h2 className="text-center text-2xl font-bold">Projects</h2>
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
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,0.5fr))] gap-4 max-[42rem]:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] max-[42rem]:gap-8">
          {data.map((entry) => (
            <Link key={entry.path} to={`/dashboard/${entry.name}`}>
              <div className="group relative flex min-h-40 origin-bottom-right cursor-pointer flex-col items-center justify-center gap-4 rounded-md border p-3 transition-transform duration-150 hover:border-primary/85">
                <Icon
                  Icon={Folder}
                  className="absolute -top-8 left-0 block hover:bg-transparent group-hover:hidden"
                  iconClassName="stroke-neutral-600/50 group-hover:stroke-primary/85 transition duration-150"
                />
                <Icon
                  Icon={FolderOpen}
                  className="absolute -top-8 left-0 hidden hover:bg-transparent hover:bg-none group-hover:block"
                  iconClassName="stroke-neutral-600/50 group-hover:stroke-primary/85 transition duration-150"
                />
                <h3 className="font-bold group-hover:underline max-[42rem]:text-xl">
                  {entry.name}
                </h3>
                <p className="text-xl text-primary/85 transition duration-150 max-[42rem]:text-base">
                  {formatDuration(entry.totalTimeSpent)} ({entry.percentage}%)
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodProjects;
