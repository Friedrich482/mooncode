import * as vscode from "vscode";

import { DashboardServer } from "@/types-schemas";

import { serveDashboardDev } from "./serve-dashboard-dev";
import { serveDashboardProd } from "./serve-dashboard-prod";

export const serveDashboard = async (
  context: vscode.ExtensionContext,
): Promise<DashboardServer | undefined> => {
  const isDev = context.extensionMode === vscode.ExtensionMode.Development;

  return isDev ? serveDashboardDev(context) : serveDashboardProd(context);
};
