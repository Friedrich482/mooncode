import { INestApplication, Inject, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";

import { AppRouter } from "./providers/providers";
import { createContext } from "./utils/create-context";

@Injectable()
export class TrpcRouter {
  constructor(
    @Inject("appRouter")
    private readonly appRouter: AppRouter,
  ) {}

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
