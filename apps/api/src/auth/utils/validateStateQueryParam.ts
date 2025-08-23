import { DASHBOARD_DEFAULT_URL } from "@repo/common/constants";
import { Request } from "express";
import { allowedClients } from "src/main";

const validateStateQueryParam = (request: Request) => {
  const stateParam = request.query["state"] as string;
  let returnUrl = DASHBOARD_DEFAULT_URL;

  if (stateParam) {
    try {
      const parsedUrl = new URL(stateParam, request.headers.origin);
      const allowedOrigins = allowedClients.map(
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
