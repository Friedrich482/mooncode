import { Button } from "@repo/ui/components/ui/button";
import CalendarPopover from "@repo/ui/components/ui/CalendarPopover";
import { usePeriodStore } from "@/hooks/store/periodStore";
import { useState } from "react";
import useUpdateCustomRangeDates from "@/hooks/useUpdateCustomRangeDates";

const CustomRangeDatesSelector = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(customRange.start));
  const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false);
  const [endDate, setEndDate] = useState(new Date(customRange.end));

  useUpdateCustomRangeDates(startDate, endDate);

  return (
    period === "Custom Range" && (
      <>
        on
        <CalendarPopover
          mode="single"
          isPopoverOpen={isStartPopoverOpen}
          setIsPopoverOpen={setIsStartPopoverOpen}
          date={startDate}
          setDate={setStartDate}
          popoverTriggerContent={
            <Button
              variant="link"
              className="p-0 text-2xl max-[25.625rem]:text-base"
            >
              {new Date(customRange.start).toDateString()}
            </Button>
          }
        />
        to
        <CalendarPopover
          mode="single"
          isPopoverOpen={isEndPopoverOpen}
          setIsPopoverOpen={setIsEndPopoverOpen}
          date={endDate}
          setDate={setEndDate}
          popoverTriggerContent={
            <Button
              variant="link"
              className="p-0 text-2xl max-[25.625rem]:text-base"
            >
              {new Date(customRange.end).toDateString()}
            </Button>
          }
        />
      </>
    )
  );
};

export default CustomRangeDatesSelector;
