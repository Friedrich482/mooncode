import { DASHBOARD_PORT, DASHBOARD_PREVIEW_PORT } from "@repo/common/constants";

export const ALLOWED_CLIENTS = Array.from(
  { length: 6 },
  (_, i) => DASHBOARD_PORT + i,
)
  .flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])
  .concat([
    `http://localhost:${DASHBOARD_PREVIEW_PORT}`,
    `http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}`,
  ]);
