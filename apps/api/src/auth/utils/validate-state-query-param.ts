import { Request } from "express";
import z from "zod";

import { ALLOWED_CLIENTS } from "@/common/constants";
import {
  DASHBOARD_DEVELOPMENT_URL,
  DASHBOARD_PRODUCTION_URL,
} from "@repo/common/constants";

import { type Environment, StateQueryParamSchema } from "../auth.dto";

export const validateStateQueryParam = <
  T extends z.ZodType<z.infer<typeof StateQueryParamSchema>>,
>(
  request: Request,
  environment: Environment,
  schema: T,
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

    const parsed = schema.safeParse(JSON.parse(decodeURIComponent(rawState)));

    if (!parsed.success) {
      return returnUrl;
    }

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
