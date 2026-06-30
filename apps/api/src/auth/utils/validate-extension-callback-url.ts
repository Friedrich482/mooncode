import { Request } from "express";

import { RedirectToGoogleDto } from "../auth.dto";

export const validateExtensionCallbackUrl = (
  rawState: Request["query"]["state"],
) => {
  if (typeof rawState !== "string") {
    return;
  }

  let decodedRawState: unknown;
  try {
    decodedRawState = JSON.parse(decodeURIComponent(rawState));
  } catch {
    return;
  }

  const parsed = RedirectToGoogleDto.safeParse(decodedRawState);

  if (!parsed.success) {
    return;
  }
  const callbackParam = parsed.data.callback;

  return callbackParam;
};
