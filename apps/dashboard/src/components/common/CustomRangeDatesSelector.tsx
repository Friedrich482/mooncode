import { useEffect, useState } from "react";

import { usePeriodStore } from "@/hooks/store/periodStore";
import { DATE_LOCALE } from "@repo/common/constants";
import { Button } from "@repo/ui/components/ui/button";
import CalendarPopover from "@repo/ui/components/ui/CalendarPopover";

const CustomRangeDatesSelector = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const setCustomRange = usePeriodStore((state) => state.setCustomRange);

  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(customRange.start));
  const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false);
  const [endDate, setEndDate] = useState(new Date(customRange.end));

  useEffect(() => {
    if (period === "Custom Range") {
      setCustomRange({
        start: startDate.toLocaleDateString(DATE_LOCALE),
        end: customRange.end,
      });
    }
  }, [startDate]);
  useEffect(() => {
    if (period === "Custom Range") {
      setCustomRange({
        start: customRange.start,
        end: endDate.toLocaleDateString(DATE_LOCALE),
      });
    }
  }, [endDate]);

  return (
    period === "Custom Range" && (
      <p className="inline text-pretty">
        {" "}
        on{" "}
        <CalendarPopover
          mode="single"
          isPopoverOpen={isStartPopoverOpen}
          setIsPopoverOpen={setIsStartPopoverOpen}
          date={startDate}
          setDate={setStartDate}
          popoverTriggerContent={
            <Button variant="link" className="p-0 text-2xl">
              {new Date(customRange.start).toDateString()}
            </Button>
          }
        />{" "}
        to{" "}
        <CalendarPopover
          mode="single"
          isPopoverOpen={isEndPopoverOpen}
          setIsPopoverOpen={setIsEndPopoverOpen}
          date={endDate}
          setDate={setEndDate}
          popoverTriggerContent={
            <Button variant="link" className="p-0 text-2xl">
              {new Date(customRange.end).toDateString()}
            </Button>
          }
        />
      </p>
    )
  );
};

export default CustomRangeDatesSelector;
