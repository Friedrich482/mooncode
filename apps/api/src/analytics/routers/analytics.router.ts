import { Injectable } from "@nestjs/common";

import { GeneralAnalyticsRouter } from "./general-analytics.router";
import { ProjectsAnalyticsRouter } from "./projects-analytics.router";

@Injectable()
export class AnalyticsRouter {
  constructor(
    private readonly generalAnalyticsRouter: GeneralAnalyticsRouter,
    private readonly projectsAnalyticsRouter: ProjectsAnalyticsRouter,
  ) {}

  procedures = {
    analytics: {
      general: this.generalAnalyticsRouter.procedures().general,
      projects: this.projectsAnalyticsRouter.procedures.projects,
    },
  };
}
