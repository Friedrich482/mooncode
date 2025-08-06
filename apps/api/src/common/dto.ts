import { ZodType, z } from "zod";
import { GroupByEnum } from "@repo/common/types";
import { INCOHERENT_DATE_RANGE_ERROR_MESSAGE } from "@repo/common/constants";
import { dateStringDto } from "@repo/common/schemas";
import getPeriodResolution from "@repo/common/getPeriodResolution";
import { isAfter } from "date-fns";

export const DateRangeSchema = z.object({
  start: dateStringDto,
  end: dateStringDto,
});

export const BaseSchema = z.object({
  ...DateRangeSchema.shape,
  groupBy: z.enum(GroupByEnum).optional(),
});

export const refineSchema = <T extends z.infer<typeof DateRangeSchema>>(
  schema: ZodType<T>,
) => {
  return schema.refine((input) => !isAfter(input.start, input.end), {
    message: INCOHERENT_DATE_RANGE_ERROR_MESSAGE,
  });
};

export const refineAndTransformSchema = <T extends z.infer<typeof BaseSchema>>(
  schema: ZodType<T>,
) => {
  return refineSchema(schema).transform((input) => {
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
