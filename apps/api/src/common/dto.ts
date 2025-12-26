import { isAfter } from "date-fns";
import { z } from "zod";

import { INCOHERENT_DATE_RANGE_ERROR_MESSAGE } from "@repo/common/constants";
import getPeriodResolution from "@repo/common/getPeriodResolution";
import { GroupByEnum, IsoDateStringSchema } from "@repo/common/types-schemas";

export const DateStringDto = IsoDateStringSchema;

export const DateRangeDto = z.object({
  start: DateStringDto,
  end: DateStringDto,
});

export const BaseDto = z.object({
  ...DateRangeDto.shape,
  groupBy: z.enum(GroupByEnum).optional(),
});

export const refineDto = <T extends z.ZodType<z.infer<typeof BaseDto>>>(
  dto: T
) => {
  return dto.refine((input) => !isAfter(input.start, input.end), {
    error: INCOHERENT_DATE_RANGE_ERROR_MESSAGE,
  });
};

export const refineAndTransformDto = <
  T extends z.ZodType<z.infer<typeof BaseDto>>,
>(
  dto: T
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

export type UserId = { userId: string };
export type NAString = "N/A" | (string & {});
export type Environment = "development" | "production";
