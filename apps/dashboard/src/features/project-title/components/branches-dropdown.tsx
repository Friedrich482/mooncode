import { useLoaderData } from "react-router";
import { ChevronDown } from "lucide-react";

import { projectLoader } from "@/loaders/project-loader";
import { useBranchesStore } from "@/stores/branches/branches-store";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useSuspenseQuery } from "@tanstack/react-query";

export const BranchesDropdown = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const trpc = useTRPC();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const { data } = useSuspenseQuery(
    trpc.analytics.projects.getProjectBranchesOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            name,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            name,
          },
    ),
  );

  const branches = useBranchesStore((state) => state.branches);
  const handleCheckBranch = useBranchesStore(
    (state) => state.handleCheckBranch,
  );

  const isProjectVersionControlled = data.every(
    (entry) => entry.name !== "N/A",
  );

  return (
    isProjectVersionControlled && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex items-center justify-center gap-2"
            variant="secondary"
          >
            <span>Git Branches</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-full" align="end">
          {data.map((branch) => (
            <DropdownMenuCheckboxItem
              key={branch.name}
              checked={branches?.some((entry) => entry === branch.name)}
              onCheckedChange={() => handleCheckBranch(branch.name)}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer gap-3 rounded-md py-1 text-base"
            >
              {branch.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
