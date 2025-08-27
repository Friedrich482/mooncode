import { RedirectToGoogleDto } from "../auth.dto";
import { Request } from "express";

const validateExtensionCallbackUrl = (request: Request) => {
  try {
    const callbackParam = RedirectToGoogleDto.parse(
      JSON.parse(decodeURIComponent(request.query["state"] as string)),
    ).callback;

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

export default validateExtensionCallbackUrl;
