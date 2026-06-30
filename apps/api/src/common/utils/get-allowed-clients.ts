import {
  DASHBOARD_DEVELOPMENT_PORT,
  DASHBOARD_PREVIEW_PORT,
  DASHBOARD_PRODUCTION_PORT,
} from "@repo/common/constants";

export const ALLOWED_CLIENTS_IN_DEVELOPMENT = [
  `http://localhost:${DASHBOARD_DEVELOPMENT_PORT}`,
  `http://127.0.0.1:${DASHBOARD_DEVELOPMENT_PORT}`,
];

export const ALLOWED_CLIENTS_IN_PRODUCTION = Array.from(
  { length: 6 },
  (_, i) => DASHBOARD_PRODUCTION_PORT + i,
)
  .flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])
  .concat([
    `http://localhost:${DASHBOARD_PREVIEW_PORT}`,
    `http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}`,
  ]);

export const getAllowedClients = () => {
  const allowedClients =
    process.env.NODE_ENV === "development"
      ? ALLOWED_CLIENTS_IN_DEVELOPMENT
      : ALLOWED_CLIENTS_IN_PRODUCTION;

  return allowedClients;
};
