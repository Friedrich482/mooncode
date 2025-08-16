"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "#lib/utils.ts";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "relative",
        month: "gap-6 ml-0 flex flex-col items-center justify-center",
        month_caption: "flex justify-center items-center h-7",
        caption_label: "text-sm font-medium",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 top-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 top-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1 place-items-center",
        weekdays: "flex items-center justify-center",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2 items-center justify-center",
        day: "size-9 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100 bg-transparent",
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        today: "[&_button]:inset-shadow-sm [&_button]:inset-shadow-primary",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50 ",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => <Chevron {...props} />,
      }}
      {...props}
    />
  );
};

// eslint-disable-next-line react/prop-types
const Chevron = ({ orientation = "left" }) => {
  switch (orientation) {
    case "left":
      return <ChevronLeftIcon className="size-4" />;
    case "right":
      return <ChevronRightIcon className="size-4" />;
    case "up":
      return <ChevronUpIcon className="size-4" />;
    case "down":
      return <ChevronDownIcon className="size-4" />;
    default:
      return null;
  }
};
