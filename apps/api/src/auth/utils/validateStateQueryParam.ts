import {
  DASHBOARD_DEVELOPMENT_URL,
  DASHBOARD_PRODUCTION_URL,
} from "@repo/common/constants";
import { ALLOWED_CLIENTS } from "src/common/constants";
import { type Environment } from "src/common/dto";
import { RedirectToGoogleDto } from "../auth.dto";
import { Request } from "express";

const validateStateQueryParam = (
  request: Request,
  environment: Environment,
) => {
  let returnUrl =
    environment === "development"
      ? DASHBOARD_DEVELOPMENT_URL
      : DASHBOARD_PRODUCTION_URL;

  try {
    const rawState = request.query["state"];
    if (typeof rawState !== "string") {
      return returnUrl;
    }

    const parsed = RedirectToGoogleDto.safeParse(
      JSON.parse(decodeURIComponent(rawState)),
    );

    if (!parsed.success) return returnUrl;

    const stateParam = parsed.data.state;

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

  return returnUrl;
};

export default validateStateQueryParam;
