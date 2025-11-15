import { Injectable } from "@nestjs/common";

import {
  GetDailyStatsForChartDtoType,
  GetDailyStatsForExtensionDtoType,
  GetDaysOfPeriodStatsDtoType,
  GetPeriodGeneralStatsDtoType,
  GetPeriodLanguagesPerDayDtoType,
  GetPeriodLanguagesTimeDtoType,
  GetTimeSpentOnPeriodDtoType,
  UpsertLanguagesDtoType,
} from "./coding-stats.dto";
import { CodingStatsDashboardService } from "./coding-stats-dashboard.service";
import { CodingStatsExtensionService } from "./coding-stats-extension.service";

@Injectable()
export class CodingStatsService {
  constructor(
    private readonly codingStatsExtensionService: CodingStatsExtensionService,
    private readonly codingStatsDashboardService: CodingStatsDashboardService
  ) {}
  async getDailyStatsForExtension(
    getDailyStatsForExtensionDto: GetDailyStatsForExtensionDtoType
  ) {
    return this.codingStatsExtensionService.getDailyStatsForExtension(
      getDailyStatsForExtensionDto
    );
  }

  async upsert(upsertLanguagesDto: UpsertLanguagesDtoType) {
    return this.codingStatsExtensionService.upsert(upsertLanguagesDto);
  }

  async getTimeSpentOnPeriod(
    getTimeSpentOnPeriodDto: GetTimeSpentOnPeriodDtoType
  ) {
    return this.codingStatsDashboardService.getTimeSpentOnPeriod(
      getTimeSpentOnPeriodDto
    );
  }

  async getDaysOfPeriodStats(
    getDaysOfPeriodStatsDto: GetDaysOfPeriodStatsDtoType
  ) {
    return this.codingStatsDashboardService.getDaysOfPeriodStats(
      getDaysOfPeriodStatsDto
    );
  }

  async getPeriodLanguagesTime(
    getPeriodLanguagesTimeDto: GetPeriodLanguagesTimeDtoType
  ) {
    return this.codingStatsDashboardService.getPeriodLanguagesTime(
      getPeriodLanguagesTimeDto
    );
  }
  async getPeriodLanguagesPerDay(
    getPeriodLanguagesPerDayDto: GetPeriodLanguagesPerDayDtoType
  ) {
    return this.codingStatsDashboardService.getPeriodLanguagesPerDay(
      getPeriodLanguagesPerDayDto
    );
  }

  async getDailyStatsForChart(
    getDailyStatsForChartDto: GetDailyStatsForChartDtoType
  ) {
    return this.codingStatsDashboardService.getDailyStatsForChart(
      getDailyStatsForChartDto
    );
  }

  async getPeriodGeneralStats(
    getPeriodGeneralStatsDto: GetPeriodGeneralStatsDtoType
  ) {
    return this.codingStatsDashboardService.getPeriodGeneralStats(
      getPeriodGeneralStatsDto
    );
  }
}
