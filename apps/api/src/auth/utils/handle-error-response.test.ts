import { Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { handleErrorResponse } from "./handle-error-response";

describe("handleErrorResponse", () => {
  const mockedError = "Unknown Error";
  const mockedErrorDescription = "An error happened";

  const mockedUrl = {
    searchParams: {
      set: vi.fn() as Function,
      toString: () => "http://localhost:4308",
    },
  } as URL;

  const response = {
    redirect: vi.fn() as Function,
  } as Response;

  it("should set the error parameters as search params in the url", () => {
    handleErrorResponse({
      url: mockedUrl,
      error: mockedError,
      errorDescription: mockedErrorDescription,
      response,
    });

    expect(mockedUrl.searchParams.set).toHaveBeenCalledTimes(2);
    expect(mockedUrl.searchParams.set).toHaveBeenNthCalledWith(
      1,
      "error",
      mockedError,
    );

    expect(mockedUrl.searchParams.set).toHaveBeenNthCalledWith(
      2,
      "error-description",
      mockedErrorDescription,
    );
  });

  it("should redirect the user to the url passed in parameter", () => {
    handleErrorResponse({
      url: mockedUrl,
      error: mockedError,
      errorDescription: mockedErrorDescription,
      response,
    });

    expect(response.redirect).toHaveBeenCalled();
    expect(response.redirect).toHaveBeenCalledWith(mockedUrl.toString());
  });
});
