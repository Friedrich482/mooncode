import { ALLOWED_CLIENTS } from "src/common/constants";
import { DASHBOARD_DEFAULT_URL } from "@repo/common/constants";
import { Request } from "express";

const validateStateQueryParam = (request: Request) => {
  const stateParam = request.query["state"] as string;
  let returnUrl = DASHBOARD_DEFAULT_URL;

  if (stateParam) {
    try {
      const parsedUrl = new URL(stateParam, request.headers.origin);
      const allowedOrigins = ALLOWED_CLIENTS.map(
        (client) => new URL(client).origin,
      );

      if (allowedOrigins.includes(parsedUrl.origin)) {
        returnUrl = stateParam;
      }
    } catch {
      // Invalid URL, use default
    }
  }
  return returnUrl;
};

export default validateStateQueryParam;
