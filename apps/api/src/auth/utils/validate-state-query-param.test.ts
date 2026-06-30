import { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DASHBOARD_DEVELOPMENT_URL } from "@repo/common/constants";

import { StateQueryParamSchema } from "../auth.dto";
import { validateStateQueryParam } from "./validate-state-query-param";

describe("validateStateQueryParam", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("should return the returnUrl", () => {
    const state = "http://localhost:4308";

    const request = {
      query: { state: JSON.stringify({ state }) } as Record<string, string>,
    } as Request;
    const schema = StateQueryParamSchema;
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const returnUrl = validateStateQueryParam(
      request.query["state"],
      environment,
      schema,
    );

    expect(returnUrl).toBeDefined();
    expect(returnUrl).toEqual(state);
  });

  it("should return the default returnUrl if the raw state query parameter extracted from the url doesn't have the expected type", () => {
    const request = {
      query: {},
    } as Request;
    const schema = StateQueryParamSchema;
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const returnUrl = validateStateQueryParam(
      request.query["state"],
      environment,
      schema,
    );

    expect(returnUrl).toBeDefined();
    expect(returnUrl).toEqual(DASHBOARD_DEVELOPMENT_URL);
  });

  it("should return the default returnUrl if the state query parameter is not a JSON stringified object", () => {
    const request = {
      query: { state: "something" } as Record<string, string>,
    } as Request;
    const schema = StateQueryParamSchema;
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const returnUrl = validateStateQueryParam(
      request.query["state"],
      environment,
      schema,
    );

    expect(returnUrl).toBeDefined();
    expect(returnUrl).toEqual(DASHBOARD_DEVELOPMENT_URL);
  });

  it("should return the default returnUrl if the decoded state query parameter is not a url", () => {
    const invalidState = "invalid state";

    const request = {
      query: { state: JSON.stringify(invalidState) } as Record<string, string>,
    } as Request;
    const schema = StateQueryParamSchema;
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const returnUrl = validateStateQueryParam(
      request.query["state"],
      environment,
      schema,
    );

    expect(returnUrl).toBeDefined();
    expect(returnUrl).toEqual(DASHBOARD_DEVELOPMENT_URL);
  });

  it("should return the default returnUrl if the state url is not in the list of allowed origins", () => {
    const invalidUrl = "https://invalidurl.com";

    const request = {
      query: { state: JSON.stringify({ state: invalidUrl }) } as Record<
        string,
        string
      >,
    } as Request;
    const schema = StateQueryParamSchema;
    const environment = "development";

    vi.stubEnv("NODE_ENV", environment);

    const returnUrl = validateStateQueryParam(
      request.query["state"],
      environment,
      schema,
    );

    expect(returnUrl).toBeDefined();
    expect(returnUrl).toEqual(DASHBOARD_DEVELOPMENT_URL);
  });
});
