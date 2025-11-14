import { Injectable } from "@nestjs/common";

import {
  CreateProjectDtoType,
  FindAllRangeProjectsDtoType,
  FindProjectByNameOnRangeDtoType,
  FindProjectDtoType,
  GetAllProjectFilesOnPeriodDtoType,
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

  async createProject(createProjectDto: CreateProjectDtoType) {
    return this.projectsCrudService.createProject(createProjectDto);
  }

  async findOneProject(findProjectDto: FindProjectDtoType) {
    return this.projectsCrudService.findOneProject(findProjectDto);
  }

  async findAllRangeProjects(
    findAllRangeProjectsDto: FindAllRangeProjectsDtoType
  ) {
    return this.projectsCrudService.findAllRangeProjects(
      findAllRangeProjectsDto
    );
  }

  async updateProject(updateProjectDto: UpdateProjectDtoType) {
    return this.projectsCrudService.updateProject(updateProjectDto);
  }

  async groupAndAggregateProjectByName(
    groupAndAggregateProjectByNameDto: GroupAndAggregateProjectByNameDtoType
  ) {
    return this.projectsAnalyticsService.groupAndAggregateProjectByName(
      groupAndAggregateProjectByNameDto
    );
  }

  async findProjectByNameOnRange(
    findProjectByNameOnRangeDto: FindProjectByNameOnRangeDtoType
  ) {
    return this.projectsAnalyticsService.findProjectByNameOnRange(
      findProjectByNameOnRangeDto
    );
  }

  async getProjectLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriodDto: GetProjectLanguagesTimeOnPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getProjectLanguagesTimeOnPeriod(
      getProjectLanguagesTimeOnPeriodDto
    );
  }

  async getProjectLanguagesTimePerDayOfPeriod(
    getProjectLanguagesTimePerDayOfPeriodDto: GetProjectLanguagesTimePerDayOfPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getProjectLanguagesTimePerDayOfPeriod(
      getProjectLanguagesTimePerDayOfPeriodDto
    );
  }
  async getAllProjectFilesOnPeriod(
    getAllProjectFilesOnPeriodDto: GetAllProjectFilesOnPeriodDtoType
  ) {
    return this.projectsAnalyticsService.getAllProjectFilesOnPeriod(
      getAllProjectFilesOnPeriodDto
    );
  }
}
