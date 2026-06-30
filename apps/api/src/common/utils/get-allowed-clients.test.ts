import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ALLOWED_CLIENTS_IN_DEVELOPMENT,
  ALLOWED_CLIENTS_IN_PRODUCTION,
  getAllowedClients,
} from "./get-allowed-clients";

describe("getAllowedClients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("should return the clients allowed in development", () => {
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const allowedClients = getAllowedClients();

    expect(allowedClients).toBeDefined();
    expect(allowedClients).toEqual(ALLOWED_CLIENTS_IN_DEVELOPMENT);
  });

  it("should return the clients allowed in production", () => {
    const environment = "production";

    vi.stubEnv("NODE_ENV", environment);

    const allowedClients = getAllowedClients();

    expect(allowedClients).toBeDefined();
    expect(allowedClients).toEqual(ALLOWED_CLIENTS_IN_PRODUCTION);
  });
});
