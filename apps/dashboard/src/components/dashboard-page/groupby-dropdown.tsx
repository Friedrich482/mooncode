import { Group } from "lucide-react";

import { GROUP_BY_DROPDOWN_ITEMS } from "@/constants";
import { usePeriodStore } from "@/hooks/store/period-store";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

export const GroupByDropDown = () => {
  const groupBy = usePeriodStore((state) => state.groupBy);
  const setGroupBy = usePeriodStore((state) => state.setGroupBy);
  const periodResolution = usePeriodStore((state) => state.periodResolution);

  return (
    periodResolution !== "day" && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="flex max-w-24 items-center gap-4"
          >
            <Group />
            <span>
              {
                GROUP_BY_DROPDOWN_ITEMS.find(
                  (entry) => entry.groupBy === groupBy,
                )?.text
              }
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 p-2" align="start">
          {GROUP_BY_DROPDOWN_ITEMS.slice(
            0,
            periodResolution === "year" || periodResolution === "month"
              ? undefined
              : periodResolution === "week"
                ? -1
                : -2,
          ).map(({ text, groupBy }) => (
            <DropdownMenuItem
              key={groupBy}
              className="cursor-pointer rounded-md py-1 text-base"
              onClick={() => setGroupBy(groupBy)}
            >
              {text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
