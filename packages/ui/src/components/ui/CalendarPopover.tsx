import { type DateRange } from "react-day-picker";

import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function CalendarPopover<T extends "single" | "range">({
  mode,
  isPopoverOpen,
  setIsPopoverOpen,
  popoverTriggerContent,
  date,
  setDate,
  className,
}: {
  mode: T;
  isPopoverOpen: boolean;
  setIsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  popoverTriggerContent: React.ReactNode;
  date: T extends "single" ? Date : DateRange;
  setDate: React.Dispatch<
    React.SetStateAction<T extends "single" ? Date : DateRange>
  >;
  className?: string;
}) {
  return (
    <Popover open={isPopoverOpen} modal={true} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>{popoverTriggerContent}</PopoverTrigger>
      <PopoverContent className={className}>
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={date as Date}
            onSelect={(e: Date | undefined) => {
              if (e !== undefined) {
                setDate(e as T extends "single" ? Date : DateRange);
                setIsPopoverOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
          />
        ) : (
          <Calendar
            mode="range"
            selected={date as DateRange}
            onSelect={(e) => {
              if (e !== undefined) {
                setDate(e as T extends "single" ? Date : DateRange);
                if (e.from && e.to) {
                  setTimeout(() => {
                    setIsPopoverOpen(false);
                  }, 800);
                }
              }
            }}
            disabled={{ after: new Date() }}
          />
        )}{" "}
      </PopoverContent>
    </Popover>
  );
}

export default CalendarPopover;
