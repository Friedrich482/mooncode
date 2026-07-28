import { AnalyticsRouter } from "@/analytics/routers/analytics.router";
import { AuthRouter } from "@/auth/auth.router";
import { ExtensionRouter } from "@/extension/extension.router";
import { HealthRouter } from "@/health/health.router";
import { TrpcService } from "@/trpc/trpc.service";
import { Provider } from "@nestjs/common";

export const appRouterProvider = {
  provide: "appRouter",
  useFactory: (
    trpcService: TrpcService,
    healthRouter: HealthRouter,
    authRouter: AuthRouter,
    analyticsRouter: AnalyticsRouter,
    extensionRouter: ExtensionRouter,
  ) => {
    const appRouter = trpcService.trpc.router({
      ...authRouter.procedures(),
      ...extensionRouter.procedures(),
      ...analyticsRouter.procedures(),
      ...healthRouter.procedures(),
    });

    return appRouter;
  },
  inject: [
    TrpcService,
    HealthRouter,
    AuthRouter,
    AnalyticsRouter,
    ExtensionRouter,
  ],
} satisfies Provider;

export type AppRouter = ReturnType<(typeof appRouterProvider)["useFactory"]>;
