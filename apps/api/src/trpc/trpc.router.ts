import { AnalyticsRouter } from "@/analytics/routers/analytics.router";
import { AuthRouter } from "@/auth/auth.router";
import { ExtensionRouter } from "@/extension/extension.router";
import { INestApplication, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";

import { createContext, TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly analyticsRouter: AnalyticsRouter,
    private readonly extensionRouter: ExtensionRouter,
  ) {}

  appRouter = this.trpcService.trpc.router({
    ...this.authRouter.procedures,
    ...this.analyticsRouter.procedures,
    ...this.extensionRouter.procedures,
  });

  async applyMiddleware(app: INestApplication) {
    app.use(
      "/trpc",
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
        createContext,
      }),
    );
  }
}

export type AppRouter = TrpcRouter["appRouter"];
