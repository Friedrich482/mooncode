import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { ChevronDown } from "lucide-react";

import { PERIODS } from "@/constants";
import { usePeriodStore } from "@/hooks/store/period-store";
import { Period } from "@/types-schemas";
import { DATE_LOCALE } from "@repo/common/constants";
import { Button } from "@repo/ui/components/ui/button";
import { CalendarPopover } from "@repo/ui/components/ui/calendar-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

export const PeriodDropDown = () => {
  const period = usePeriodStore((state) => state.period);
  const setPeriod = usePeriodStore((state) => state.setPeriod);
  const setCustomRange = usePeriodStore((state) => state.setCustomRange);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
  });
  const start = useMemo(
    () => dateRange.from?.toLocaleDateString(DATE_LOCALE),
    [dateRange.from],
  );
  const end = useMemo(
    () => dateRange.to?.toLocaleDateString(DATE_LOCALE),
    [dateRange.to],
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleClick = (item: Period) => {
    if (item === "Custom Range") {
      setIsPopoverOpen((prev) => !prev);
    }
    setPeriod(item);
  };

  useEffect(() => {
    if (period === "Custom Range" && start && end) {
      setCustomRange({
        start,
        end,
      });
    }
  }, [start, end]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center justify-center gap-2">
          <span>{period}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 p-2" align="start">
        {PERIODS.map((item) => {
          const isCustomRange = item === "Custom Range";

          if (!isCustomRange) {
            return (
              <DropdownMenuItem
                key={item}
                onClick={() => handleClick(item)}
                className="cursor-pointer rounded-md py-1 text-base"
              >
                {item}
              </DropdownMenuItem>
            );
          }
          return (
            <CalendarPopover
              key={item}
              mode="range"
              className="translate-x-[13.55rem] translate-y-11"
              date={dateRange}
              setDate={setDateRange}
              isPopoverOpen={isPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              popoverTriggerContent={
                <DropdownMenuItem
                  className="cursor-pointer rounded-md py-1 text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(item);
                  }}
                >
                  {item}
                </DropdownMenuItem>
              }
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
