import { AuthRouter } from "src/auth/auth.router";
import { CodingStatsRouter } from "src/coding-stats/coding-stats.router";
import { FilesStatsRouter } from "src/files-stats/files-stats.router";
import { PasswordResetsRouter } from "src/password-resets/password-resets.router";
import { PendingRegistrationsRouter } from "src/pending-registrations/pending-registrations.router";

import { INestApplication, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";

import { createContext, TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly codingStatsRouter: CodingStatsRouter,
    private readonly filesStatsRouter: FilesStatsRouter,
    private readonly pendingRegistrationsRouter: PendingRegistrationsRouter,
    private readonly passwordResetsRouter: PasswordResetsRouter
  ) {}

  appRouter = this.trpcService.trpc.router({
    ...this.authRouter.procedures,
    ...this.codingStatsRouter.procedures,
    ...this.filesStatsRouter.procedures,
    ...this.pendingRegistrationsRouter.procedures,
    ...this.passwordResetsRouter.procedures,
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
