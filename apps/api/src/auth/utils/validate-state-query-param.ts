import { Request } from "express";
import z from "zod";

import { Environment } from "@/common/dto";
import { getAllowedClients } from "@/common/utils/get-allowed-clients";
import {
  DASHBOARD_DEVELOPMENT_URL,
  DASHBOARD_PRODUCTION_URL,
} from "@repo/common/constants";

import { StateQueryParamSchema } from "../auth.dto";

export const validateStateQueryParam = <
  T extends z.ZodType<z.infer<typeof StateQueryParamSchema>>,
>(
  rawState: Request["query"]["state"],
  environment: Environment,
  schema: T,
) => {
  const defaultReturnUrl =
    environment === "development"
      ? DASHBOARD_DEVELOPMENT_URL
      : DASHBOARD_PRODUCTION_URL;

  if (typeof rawState !== "string") {
    return defaultReturnUrl;
  }

  let decodedRawState: unknown;

  try {
    decodedRawState = JSON.parse(decodeURIComponent(rawState));
  } catch {
    return defaultReturnUrl;
  }

  const parsed = schema.safeParse(decodedRawState);

  if (!parsed.success) {
    return defaultReturnUrl;
  }

  const stateParam = parsed.data.state;
  const parsedUrl = new URL(stateParam);

  const allowedClients = getAllowedClients();
  const allowedOrigins = allowedClients.map((client) => new URL(client).origin);

  if (allowedOrigins.includes(parsedUrl.origin)) {
    return stateParam;
  }

  return defaultReturnUrl;
};
