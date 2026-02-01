import * as vscode from "vscode";

import { getDashboardServer } from "@/extension";

export const openDashboard = async () => {
  const dashboardServer = getDashboardServer();

  try {
    dashboardServer.navigate("/");
  } catch (error) {
    vscode.window.showErrorMessage(`Error opening dashboard: ${error}`);
  }
};
