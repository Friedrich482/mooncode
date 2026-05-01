import { isAfter } from "date-fns";
import z from "zod";

import { DateStringDto } from "@/common/dto";
import { getPeriodResolution } from "@repo/common/get-period-resolution";
import { GroupByEnum } from "@repo/common/types-schemas";

export const DateRangeDto = z.object({
  start: DateStringDto,
  end: DateStringDto,
});

export const BaseDto = z.object({
  ...DateRangeDto.shape,
  groupBy: z.enum(GroupByEnum).optional(),
});

export const refineDto = <T extends z.ZodType<z.infer<typeof BaseDto>>>(
  dto: T,
) => {
  return dto.refine((input) => !isAfter(input.start, input.end), {
    error: "Start date must be before end date",
  });
};

export const refineAndTransformDto = <
  T extends z.ZodType<z.infer<typeof BaseDto>>,
>(
  dto: T,
) => {
  return refineDto(dto).transform((input) => {
    //  this prevent the groupBy attribute to be "weeks" for periods like "Last 7 days", "This week" or "Last week"
    const periodResolution = getPeriodResolution(input.start, input.end);
    if (periodResolution === "day") {
      input.groupBy = "days";
    }
    if (periodResolution === "week" && input.groupBy === "months") {
      input.groupBy = "weeks";
    }
    return { ...input, periodResolution };
  });
};

export type NAString = "N/A" | (string & {});
