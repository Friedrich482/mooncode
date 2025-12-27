import { GeneralAnalyticsRouter } from "src/analytics/routers/general-analytics.router";
import { ProjectAnalyticsRouter } from "src/analytics/routers/projects-analytics.router";
import { AuthRouter } from "src/auth/auth.router";

import { INestApplication, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";

import { createContext, TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly generalAnalyticsRouter: GeneralAnalyticsRouter,
    private readonly projectAnalyticsRouter: ProjectAnalyticsRouter
  ) {}

  appRouter = this.trpcService.trpc.router({
    ...this.authRouter.procedures,
    ...this.generalAnalyticsRouter.procedures,
    ...this.projectAnalyticsRouter.procedures,
  });

  async applyMiddleware(app: INestApplication) {
    app.use(
      "/trpc",
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
        createContext,
      })
    );
  }
}

export type AppRouter = TrpcRouter["appRouter"];
