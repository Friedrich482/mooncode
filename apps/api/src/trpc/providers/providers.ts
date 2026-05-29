import superjson from "superjson";

import { AnalyticsRouter } from "@/analytics/routers/analytics.router";
import { AuthRouter } from "@/auth/auth.router";
import { EnvService } from "@/env/env.service";
import { ExtensionRouter } from "@/extension/extension.router";
import { Provider } from "@nestjs/common";
import { initTRPC } from "@trpc/server";
import { createTRPCStoreLimiter } from "@trpc-limiter/memory";

import { errorFormatter } from "../filters/error-formatter";
import { TrpcContext } from "../trpc.dto";
import { TrpcService } from "../trpc.service";

const trpcProvider = {
  provide: "trpc",
  useFactory: (envService: EnvService) => {
    const trpc = initTRPC.context<TrpcContext>().create({
      transformer: superjson,
      errorFormatter: ({ error, shape }) =>
        errorFormatter({
          environment: envService.get("NODE_ENV"),
          error,
          shape,
        }),
    });

    return trpc;
  },
  inject: [EnvService],
} satisfies Provider;

export type TrpcInstance = ReturnType<(typeof trpcProvider)["useFactory"]>;

const limitersProvider = {
  provide: "limiters",
  useFactory: () => {
    const limiters = new Map<
      string,
      ReturnType<typeof createTRPCStoreLimiter<TrpcInstance>>
    >();

    return limiters;
  },
  inject: ["trpc"],
} satisfies Provider;

const appRouterProvider = {
  provide: "appRouter",
  useFactory: (
    trpcService: TrpcService,
    authRouter: AuthRouter,
    analyticsRouter: AnalyticsRouter,
    extensionRouter: ExtensionRouter,
  ) => {
    const appRouter = trpcService.trpc.router({
      ...authRouter.procedures,
      ...analyticsRouter.procedures,
      ...extensionRouter.procedures,
    });

    return appRouter;
  },
  inject: [TrpcService, AuthRouter, AnalyticsRouter, ExtensionRouter],
} satisfies Provider;

export type AppRouter = ReturnType<(typeof appRouterProvider)["useFactory"]>;

export const providers = [trpcProvider, limitersProvider, appRouterProvider];
