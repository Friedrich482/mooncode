import {
  DASHBOARD_DEVELOPMENT_PORT,
  DASHBOARD_PREVIEW_PORT,
  DASHBOARD_PRODUCTION_PORT,
} from "@repo/common/constants";

export const ALLOWED_CLIENTS = Array.from(
  { length: 6 },
  (_, i) => DASHBOARD_PRODUCTION_PORT + i
)
  .flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])
  .concat([
    `http://localhost:${DASHBOARD_PREVIEW_PORT}`,
    `http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}`,
    `http://localhost:${DASHBOARD_DEVELOPMENT_PORT}`,
    `http://127.0.0.1:${DASHBOARD_DEVELOPMENT_PORT}`,
  ]);
