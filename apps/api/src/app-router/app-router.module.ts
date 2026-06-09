import { AnalyticsModule } from "@/analytics/analytics.module";
import { AuthModule } from "@/auth/auth.module";
import { ExtensionModule } from "@/extension/extension.module";
import { Module } from "@nestjs/common";

import { AppRouterRouter } from "./app-router.router";
import { appRouterProvider } from "./providers/app-router.provider";

@Module({
  imports: [AuthModule, AnalyticsModule, ExtensionModule],

  providers: [appRouterProvider, AppRouterRouter],
})
export class AppRouterModule {}
