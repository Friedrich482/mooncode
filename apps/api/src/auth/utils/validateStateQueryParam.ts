import { ALLOWED_CLIENTS } from "src/common/constants";
import { DASHBOARD_DEFAULT_URL } from "@repo/common/constants";
import { RedirectToGoogleDto } from "../auth.dto";
import { Request } from "express";

const validateStateQueryParam = (request: Request) => {
  let returnUrl = DASHBOARD_DEFAULT_URL;

  try {
    const stateParam = RedirectToGoogleDto.parse(
      JSON.parse(decodeURIComponent(request.query["state"] as string)),
    ).state;

    if (stateParam) {
      const parsedUrl = new URL(stateParam, request.headers.origin);
      const allowedOrigins = ALLOWED_CLIENTS.map(
        (client) => new URL(client).origin,
      );

      if (allowedOrigins.includes(parsedUrl.origin)) {
        returnUrl = stateParam;
      }
    }
  } catch {
    // Invalid URL, use default
  }

  return returnUrl;
};

export default validateStateQueryParam;
