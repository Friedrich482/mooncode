import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EnvService } from "@/env/env.service";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { EXTENSION_ID, PUBLISHER } from "@repo/common/constants";
import { Procedure } from "@vitest/spy";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import * as errorResponseUtils from "./utils/handle-error-response";
import * as extensionCallbackUrlUtils from "./utils/validate-extension-callback-url";
import * as queryParamsUtils from "./utils/validate-state-query-param";

describe("AuthController", () => {
  let authController: AuthController;

  let authService: {
    redirectToGoogle: Mock<Procedure>;
    handleGoogleCallback: Mock<Procedure>;
    redirectToGoogleForLinking: Mock<Procedure>;
    handleGoogleLinkingCallback: Mock<Procedure>;
  };

  let envService: {
    get: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    authService = {
      redirectToGoogle: vi.fn(),
      handleGoogleCallback: vi.fn(),
      redirectToGoogleForLinking: vi.fn(),
      handleGoogleLinkingCallback: vi.fn(),
    };

    envService = {
      get: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        AuthController,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: EnvService,
          useValue: envService,
        },
      ],
    }).compile();

    authController = moduleRef.get(AuthController);
  });

  describe("redirectToGoogle", () => {
    const mockedEntry = {
      state: "http://localhost:4308",
      callback: `vscode://${PUBLISHER.toLowerCase()}.${EXTENSION_ID}/auth-callback?state=randombytes`,
    };

    const response = {
      redirect: vi.fn() as Function,
    } as Response;

    const mockedOutput = {
      googleAuthUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    };

    it("should call the redirectToGoogle method of the authService", () => {
      authService.redirectToGoogle.mockReturnValue(mockedOutput);

      authController.redirectToGoogle(response, mockedEntry);

      expect(authService.redirectToGoogle).toHaveBeenCalled();
      expect(authService.redirectToGoogle).toHaveBeenCalledWith(mockedEntry);
    });

    it("should redirect the user to the url returned by the redirectToGoogle method of the authService", () => {
      authService.redirectToGoogle.mockReturnValue(mockedOutput);

      authController.redirectToGoogle(response, mockedEntry);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        mockedOutput.googleAuthUrl,
      );
    });
  });

  describe("handleGoogleCallback", () => {
    const request = {} as Request;
    const response = {
      redirect: vi.fn() as Function,
      cookie: vi.fn() as Function,
    } as Response;
    const returnUrl = "http://localhost:4308";
    const callbackUrl = `vscode://${PUBLISHER.toLowerCase()}.${EXTENSION_ID}/auth-callback?state=randombytes`;

    it("should call the handleGoogleCallback method of the authService", () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
        email: "test@gmail.com",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(callbackUrl);

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      authController.handleGoogleCallback(mockedEntry, response, request);

      expect(authService.handleGoogleCallback).toHaveBeenCalled();
      expect(authService.handleGoogleCallback).toHaveBeenCalledWith(
        expect.objectContaining(mockedEntry),
      );
    });

    it("should call the handleGoogleCallback method of the authService with the proper parameters in case of success", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
        email: "test@gmail.com",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(callbackUrl);

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleCallback(mockedEntry, response, request);

      expect(authService.handleGoogleCallback).toHaveBeenCalled();
      expect(authService.handleGoogleCallback).toHaveBeenCalledWith({
        ...mockedEntry,
        type: "success",
      });
    });

    it("should set a cookie in the response in case of success", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
        email: "test@gmail.com",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(callbackUrl);

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleCallback(mockedEntry, response, request);

      expect(response.cookie).toHaveBeenCalled();
      expect(response.cookie).toHaveBeenCalledWith(
        expect.anything(),
        mockedOutput.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });

    it("should redirect the user to the proper url with login coming from the vscode extension", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
        email: "test@gmail.com",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(callbackUrl);

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleCallback(mockedEntry, response, request);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(returnUrl),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`callback=${encodeURIComponent(callbackUrl)}`),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`token=${mockedOutput.accessToken}`),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          `email=${encodeURIComponent(mockedOutput.email)}`,
        ),
      );
    });

    it("should redirect the user to the proper url with a login request not coming from the vscode extension", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
        email: "test@gmail.com",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(undefined);

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleCallback(mockedEntry, response, request);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(returnUrl),
      );
    });

    it("should call the handleGoogleCallback method of the authService with the proper parameters in case of error", async () => {
      const mockedEntry = {
        error: "Error",
      };
      const mockedOutput = {
        error: "Error",
        errorDescription:
          "Something went wrong during the authentication process. Please try again",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(
        extensionCallbackUrlUtils,
        "validateExtensionCallbackUrl",
      ).mockReturnValue(callbackUrl);
      vi.spyOn(errorResponseUtils, "handleErrorResponse").mockImplementation(
        () => {},
      );

      authService.handleGoogleCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleCallback(mockedEntry, response, request);

      expect(authService.handleGoogleCallback).toHaveBeenCalled();
      expect(authService.handleGoogleCallback).toHaveBeenCalledWith({
        ...mockedEntry,
        type: "error",
      });
    });
  });

  describe("redirectToGoogleForLinking", () => {
    const mockedEntry = {
      state: "http://localhost:4308",
    };

    const response = {
      redirect: vi.fn() as Function,
    } as Response;

    const mockedOutput = {
      googleUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    };

    it("should call the redirectToGoogle method of the authService", () => {
      authService.redirectToGoogleForLinking.mockReturnValue(mockedOutput);

      authController.redirectToGoogleForLinking(response, mockedEntry);

      expect(authService.redirectToGoogleForLinking).toHaveBeenCalled();
      expect(authService.redirectToGoogleForLinking).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should redirect the user to the url returned by the redirectToGoogleForLinking method of the authService", () => {
      authService.redirectToGoogleForLinking.mockReturnValue(mockedOutput);

      authController.redirectToGoogleForLinking(response, mockedEntry);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(mockedOutput.googleUrl);
    });
  });

  describe("handleGoogleLinkingCallback", () => {
    const request = {
      user: {
        sub: "1",
      },
    } as Request & { user: { sub: string } };
    const response = {
      redirect: vi.fn() as Function,
      cookie: vi.fn() as Function,
    } as Response;
    const returnUrl = "http://localhost:4308";

    it("should call the handleGoogleLinkingCallback method of the authService", () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );

      authService.handleGoogleLinkingCallback.mockResolvedValue(mockedOutput);

      authController.handleGoogleLinkingCallback(
        mockedEntry,
        response,
        request,
      );

      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalled();
      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalledWith(
        expect.objectContaining(mockedEntry),
      );
    });

    it("should call the handleGoogleLinkingCallback method of the authService with the proper parameters in case of success", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );

      authService.handleGoogleLinkingCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleLinkingCallback(
        mockedEntry,
        response,
        request,
      );

      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalled();
      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalledWith({
        ...mockedEntry,
        type: "success",
        userId: request.user.sub,
      });
    });

    it("should set a cookie in the response in case of success", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );

      authService.handleGoogleLinkingCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleLinkingCallback(
        mockedEntry,
        response,
        request,
      );

      expect(response.cookie).toHaveBeenCalled();
      expect(response.cookie).toHaveBeenCalledWith(
        expect.anything(),
        mockedOutput.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });

    it("should redirect the user to the proper url", async () => {
      const mockedEntry = {
        code: "some_code_sent_by_google",
      };
      const mockedOutput = {
        accessToken: "token",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );

      authService.handleGoogleLinkingCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleLinkingCallback(
        mockedEntry,
        response,
        request,
      );

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(returnUrl),
      );
    });

    it("should call the handleGoogleLinkingCallback method of the authService with the proper parameters in case of error", async () => {
      const mockedEntry = {
        error: "Error",
      };
      const mockedOutput = {
        error: "Error",
        errorDescription:
          "Something went wrong during the authentication process. Please try again",
      };

      vi.spyOn(queryParamsUtils, "validateStateQueryParam").mockReturnValue(
        returnUrl,
      );
      vi.spyOn(errorResponseUtils, "handleErrorResponse").mockImplementation(
        () => {},
      );

      authService.handleGoogleLinkingCallback.mockResolvedValue(mockedOutput);

      await authController.handleGoogleLinkingCallback(
        mockedEntry,
        response,
        request,
      );

      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalled();
      expect(authService.handleGoogleLinkingCallback).toHaveBeenCalledWith({
        ...mockedEntry,
        type: "error",
        userId: request.user.sub,
      });
    });
  });
});
