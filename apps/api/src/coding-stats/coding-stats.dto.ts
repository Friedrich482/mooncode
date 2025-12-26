import { z } from "zod";
import {
  BaseDto,
  DateRangeDto,
  DateStringDto,
  refineAndTransformDto,
  refineDto,
  UserId,
} from "src/common/dto";

export const GetDailyStatsForExtensionDto = z.object({
  dateString: DateStringDto,
});

export const UpsertLanguagesDto = z.object({
  targetedDate: DateStringDto,
  timeSpentOnDay: z.number().int(),
  timeSpentPerLanguage: z.record(z.string().min(1), z.number().int()),
});

export const GetTimeSpentOnPeriodDto = refineDto(DateRangeDto);

export const GetDaysOfPeriodStatsDto = refineAndTransformDto(BaseDto);

export const GetPeriodLanguagesTimeDto = GetTimeSpentOnPeriodDto;

export const GetPeriodLanguagesPerDayDto = GetDaysOfPeriodStatsDto;

export const GetDailyStatsForChartDto = GetDailyStatsForExtensionDto;

export const GetPeriodGeneralStatsDto = refineAndTransformDto(
  z.object({ ...BaseDto.shape, todaysDateString: DateStringDto })
);

export type GetDailyStatsForExtensionDtoType = z.infer<
  typeof GetDailyStatsForExtensionDto
> &
  UserId;

export type UpsertLanguagesDtoType = z.infer<typeof UpsertLanguagesDto> &
  UserId;

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

export type GetDailyStatsForChartDtoType = z.infer<
  typeof GetDailyStatsForChartDto
> &
  UserId;

export type GetPeriodGeneralStatsDtoType = z.infer<
  typeof GetPeriodGeneralStatsDto
> &
  UserId;
