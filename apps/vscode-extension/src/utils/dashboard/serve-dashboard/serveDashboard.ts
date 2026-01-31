import * as vscode from "vscode";

import { DashboardServer } from "@/types-schemas";

import serveDashboardDev from "./serveDashboardDev";
import serveDashboardProd from "./serveDashboardProd";

const serveDashboard = async (
  context: vscode.ExtensionContext,
): Promise<DashboardServer | undefined> => {
  const isDev = context.extensionMode === vscode.ExtensionMode.Development;

  return isDev ? serveDashboardDev(context) : serveDashboardProd(context);
};

export default serveDashboard;
