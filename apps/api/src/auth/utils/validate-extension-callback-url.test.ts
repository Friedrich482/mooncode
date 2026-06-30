import { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EXTENSION_ID,
  EXTENSION_LOGIN_PATH,
  PUBLISHER,
} from "@repo/common/constants";

import { validateExtensionCallbackUrl } from "./validate-extension-callback-url";

describe("validateExtensionCallbackUrl", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("should return the callback url of the extension", () => {
    const state = "http://localhost:4308";
    const callback = `vscode://${PUBLISHER.toLowerCase()}.${EXTENSION_ID}/${EXTENSION_LOGIN_PATH}?state=randombytes`;

    const request = {
      query: { state: JSON.stringify({ state, callback }) } as Record<
        string,
        string
      >,
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeDefined();
    expect(callbackParam).toEqual(callback);
  });

  it("should return undefined if the raw state query parameter extracted from the url doesn't have the expected type", () => {
    const request = {
      query: {},
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeUndefined();
  });

  it("should return undefined if the state query parameter is not a JSON stringified object", () => {
    const request = {
      query: { state: "something" } as Record<string, string>,
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeUndefined();
  });

  it("should return undefined if the decoded state query parameter is not a valid url", () => {
    const state = "not-a-url";
    const callback = `vscode://${PUBLISHER.toLowerCase()}.${EXTENSION_ID}/${EXTENSION_LOGIN_PATH}?state=randombytes`;

    const request = {
      query: { state: JSON.stringify({ state, callback }) } as Record<
        string,
        string
      >,
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeUndefined();
  });

  it("should return undefined if the decoded callback query parameter is not a valid url", () => {
    const state = "http://localhost:4308";
    const callback = "not-a-url";

    const request = {
      query: { state: JSON.stringify({ state, callback }) } as Record<
        string,
        string
      >,
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeUndefined();
  });

  it("should return undefined if the callback url does not start with vscode://", () => {
    const state = "http://localhost:4308";
    const callback = "https://example.com/callback";

    const request = {
      query: { state: JSON.stringify({ state, callback }) } as Record<
        string,
        string
      >,
    } as Request;

    const callbackParam = validateExtensionCallbackUrl(request.query["state"]);

    expect(callbackParam).toBeUndefined();
  });
});
