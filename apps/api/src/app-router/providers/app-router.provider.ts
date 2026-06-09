import { AnalyticsRouter } from "@/analytics/routers/analytics.router";
import { AuthRouter } from "@/auth/auth.router";
import { ExtensionRouter } from "@/extension/extension.router";
import { TrpcService } from "@/trpc/trpc.service";
import { Provider } from "@nestjs/common";

export const appRouterProvider = {
  provide: "appRouter",
  useFactory: (
    trpcService: TrpcService,
    authRouter: AuthRouter,
    analyticsRouter: AnalyticsRouter,
    extensionRouter: ExtensionRouter,
  ) => {
    const appRouter = trpcService.trpc.router({
      ...authRouter.procedures(),
      ...analyticsRouter.procedures,
      ...extensionRouter.procedures,
    });

    return appRouter;
  },
  inject: [TrpcService, AuthRouter, AnalyticsRouter, ExtensionRouter],
} satisfies Provider;

export type AppRouter = ReturnType<(typeof appRouterProvider)["useFactory"]>;
