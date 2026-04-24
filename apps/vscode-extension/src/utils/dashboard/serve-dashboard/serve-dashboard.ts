import vscode from "vscode";

import { getExtensionContext } from "@/extension";
import { DashboardServer } from "@/types-schemas";

import { serveDashboardDev } from "./serve-dashboard-dev";
import { serveDashboardProd } from "./serve-dashboard-prod";

export const serveDashboard = async (): Promise<
  DashboardServer | undefined
> => {
  const context = getExtensionContext();

  const isDev = context.extensionMode === vscode.ExtensionMode.Development;

  return isDev ? serveDashboardDev() : serveDashboardProd();
};
