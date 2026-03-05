import z from "zod";
import { DateStringDto } from "src/common/dto";

import { UserId } from "@repo/common/types-schemas";

import {
  BaseDto,
  DateRangeDto,
  refineAndTransformDto,
  refineDto,
} from "./common";

export const GetTimeSpentOnPeriodDto = refineDto(DateRangeDto);

export const GetDaysOfPeriodStatsDto = refineAndTransformDto(BaseDto);

export const GetPeriodLanguagesTimeDto = refineDto(DateRangeDto);

export const GetPeriodLanguagesPerDayDto = refineAndTransformDto(BaseDto);

export const GetDailyStatsDto = z.object({
  dateString: DateStringDto,
});

export const GetPeriodGeneralStatsDto = refineAndTransformDto(
  z.object({ ...BaseDto.shape, todaysDateString: DateStringDto }),
);

export type GetTimeSpentOnPeriodDtoType = z.infer<
  typeof GetTimeSpentOnPeriodDto
> &
  UserId;

export type GetDaysOfPeriodStatsDtoType = z.infer<
  typeof GetDaysOfPeriodStatsDto
> &
  UserId;

export type GetPeriodLanguagesTimeDtoType = z.infer<
  typeof GetPeriodLanguagesTimeDto
> &
  UserId;

export type GetPeriodLanguagesPerDayDtoType = z.infer<
  typeof GetPeriodLanguagesPerDayDto
> &
  UserId;

export type GetDailyStatsDtoType = z.infer<typeof GetDailyStatsDto> & UserId;

export type GetPeriodGeneralStatsDtoType = z.infer<
  typeof GetPeriodGeneralStatsDto
> &
  UserId;
