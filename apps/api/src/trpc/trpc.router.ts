import { AuthRouter } from "src/auth/auth.router";
import { CodingStatsRouter } from "src/coding-stats/coding-stats.router";
import { FilesStatsRouter } from "src/files-stats/files-stats.router";

import { INestApplication, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";

import { createContext, TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly codingStatsRouter: CodingStatsRouter,
    private readonly filesStatsRouter: FilesStatsRouter
  ) {}

  appRouter = this.trpcService.trpc.router({
    ...this.authRouter.procedures,
    ...this.codingStatsRouter.procedures,
    ...this.filesStatsRouter.procedures,
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
