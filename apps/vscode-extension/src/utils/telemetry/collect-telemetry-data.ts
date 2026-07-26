import vscode from "vscode";

import { getExtensionContext } from "@/extension";
import { SemVerSchema } from "@repo/common/types-schemas";
import { isTRPCClientError } from "@trpc/client";

import { handleInvalidTokenError } from "../errors/handle-invalid-token-error";
import { logError } from "../logger/logger";
import { trpc } from "../trpc/client";

export const collectTelemetryData = async () => {
  if (!vscode.env.isTelemetryEnabled) {
    return;
  }

  const context = getExtensionContext();

  const rawExtensionVersion = context.extension.packageJSON.version;

  const parsedExtensionVersion = SemVerSchema.safeParse(rawExtensionVersion);
  if (!parsedExtensionVersion.success) {
    logError(`Invalid extension version: ${rawExtensionVersion}`);
    return;
  }

  const extensionVersion = parsedExtensionVersion.data;
  const vscodeVersion = vscode.version;
  const machineId = vscode.env.machineId;

  try {
    await trpc.extension.collectTelemetryData.mutate({
      machineId,
      extensionVersion,
      vscodeVersion,
    });
  } catch (error) {
    if (isTRPCClientError(error)) {
      logError(
        `tRPC Error: ${error.message}, Cause: ${error.cause}, Code: ${error.data?.code}.`,
      );
      await handleInvalidTokenError(error);
    } else {
      logError(`Unknown error during telemetry data collection: ${error}`);
    }
  }
};
