import { Request } from "express";

import { RedirectToGoogleDto } from "../auth.dto";

export const validateExtensionCallbackUrl = (request: Request) => {
  try {
    const rawState = request.query["state"];
    if (typeof rawState !== "string" || rawState.length > 4096) {
      return undefined;
    }

    const parsed = RedirectToGoogleDto.safeParse(
      JSON.parse(decodeURIComponent(rawState)),
    );

    if (!parsed.success) {
      return undefined;
    }
    const callbackParam = parsed.data.callback;

    if (
      callbackParam &&
      (!callbackParam.startsWith("vscode://") ||
        !callbackParam.includes("/auth-callback"))
    ) {
      throw new Error("Incorrect callback url");
    }

    return callbackParam;
  } catch {
    return undefined;
  }
};
