import { Injectable } from "@nestjs/common";

import {
  CheckProjectExistsDtoType,
  CreateProjectDtoType,
  FindProjectByNameOnRangeDtoType,
  FindProjectDtoType,
  FindRangeProjectsDtoType,
  GetProjectFilesOnPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodDtoType,
  GetProjectLanguagesTimePerDayOfPeriodDtoType,
  GroupAndAggregateProjectByNameDtoType,
  UpdateProjectDtoType,
} from "./projects.dto";
import { ProjectsAnalyticsService } from "./projects-analytics.service";
import { ProjectsCrudService } from "./projects-crud.service";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsCrudService: ProjectsCrudService,
    private readonly projectsAnalyticsService: ProjectsAnalyticsService
  ) {}

  async create(createProjectDto: CreateProjectDtoType) {
    return this.projectsCrudService.create(createProjectDto);
  }

  async findOne(findProjectDto: FindProjectDtoType) {
    return this.projectsCrudService.findOne(findProjectDto);
  }

  async checkExists(checkProjectExistsDto: CheckProjectExistsDtoType) {
    return this.projectsCrudService.checkExists(checkProjectExistsDto);
  }

  async findRange(findRangeProjectsDto: FindRangeProjectsDtoType) {
    return this.projectsCrudService.findRange(findRangeProjectsDto);
  }

  async update(updateProjectDto: UpdateProjectDtoType) {
    return this.projectsCrudService.update(updateProjectDto);
  }

  async groupAndAggregateByName(
    groupAndAggregateProjectByNameDto: GroupAndAggregateProjectByNameDtoType
  ) {
    return this.projectsAnalyticsService.groupAndAggregateByName(
      groupAndAggregateProjectByNameDto
    );
  }

  async findByNameOnRange(
    findProjectByNameOnRangeDto: FindProjectByNameOnRangeDtoType
  ) {
    return this.projectsAnalyticsService.findByNameOnRange(
      findProjectByNameOnRangeDto
    );
  }

  async getLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriodDto: GetProjectLanguagesTimeOnPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getLanguagesTimeOnPeriod(
      getProjectLanguagesTimeOnPeriodDto
    );
  }

  async getLanguagesTimePerDayOfPeriod(
    getProjectLanguagesTimePerDayOfPeriodDto: GetProjectLanguagesTimePerDayOfPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getLanguagesTimePerDayOfPeriod(
      getProjectLanguagesTimePerDayOfPeriodDto
    );
  }
  async getFilesOnPeriod(
    getProjectFilesOnPeriodDto: GetProjectFilesOnPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getFilesOnPeriod(
      getProjectFilesOnPeriodDto
    );
  }
}
