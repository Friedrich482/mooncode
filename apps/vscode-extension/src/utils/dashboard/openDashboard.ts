import * as vscode from "vscode";

import { getDashboardPort } from "@/extension";

const openDashboard = async () => {
  const dashboardPort = getDashboardPort();
  const dashboardUrl = `http://localhost:${dashboardPort}`;

  try {
    const success = await vscode.env.openExternal(
      vscode.Uri.parse(dashboardUrl)
    );
    if (success) {
      vscode.window.showInformationMessage(
        `Opening dashboard at ${dashboardUrl}`
      );
    } else {
      vscode.window.showErrorMessage("Failed to open the dashboard URL");
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error opening dashboard: ${error}`);
  }
};

export default openDashboard;
