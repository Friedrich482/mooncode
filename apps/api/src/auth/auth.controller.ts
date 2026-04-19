import { Request, Response } from "express";

import { ZodPipe } from "@/common/pipes/zod.pipe";
import { EnvService } from "@/env/env.service";
import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import {
  HandleGoogleQueryDto,
  HandleGoogleQueryDtoType,
  RedirectToGoogleDto,
  RedirectToGoogleDtoType,
  RedirectToGoogleForLinkingDto,
  RedirectToGoogleForLinkingDtoType,
} from "./auth.dto";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { handleErrorResponse } from "./utils/handle-error-response";
import { validateExtensionCallbackUrl } from "./utils/validate-extension-callback-url";
import { validateStateQueryParam } from "./utils/validate-state-query-param";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
  ) {}

  private readonly AUTH_COOKIE_NAME = "auth_token";
  private readonly COOKIE_MAX_AGE = 28 * 24 * 60 * 60 * 1000; // 28 days

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @Get("/google")
  async redirectToGoogle(
    @Res() response: Response,
    @Query() queryParams: RedirectToGoogleDtoType,
  ) {
    const { googleAuthUrl } = await this.authService.redirectToGoogle({
      ...queryParams,
    });

    response.redirect(googleAuthUrl);
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @Get("/google/callback")
  async handleGoogleCallBack(
    @Query(new ZodPipe(HandleGoogleQueryDto))
    queryParams: HandleGoogleQueryDtoType,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const returnUrl = validateStateQueryParam(
      request,
      this.envService.get("NODE_ENV"),
      RedirectToGoogleDto,
    );
    const callbackUrl = validateExtensionCallbackUrl(request);

    const url = new URL(returnUrl);
    const errorUrl = new URL(`${returnUrl}/login`);

    const result = await this.authService.handleGoogleCallBack(
      "code" in queryParams
        ? {
            ...queryParams,
            type: "success",
          }
        : {
            ...queryParams,
            type: "error",
          },
    );

    if ("error" in result) {
      handleErrorResponse({
        url: errorUrl,
        error: result.error,
        errorDescription: result.errorDescription,
        response,
      });

      return;
    }

    const { accessToken: token, email } = result;

    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: this.COOKIE_MAX_AGE,
    });

    response.redirect(
      `${url}${callbackUrl ? `?callback=${encodeURIComponent(callbackUrl)}&token=${token}&email=${encodeURIComponent(email)}` : ""}`.toString(),
    );

    return;
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @UseGuards(AuthGuard)
  @Get("/google/linking")
  async redirectToGoogleForLinking(
    @Res() response: Response,
    @Query()
    queryParams: RedirectToGoogleForLinkingDtoType,
  ) {
    const { googleUrl } = await this.authService.redirectToGoogleForLinking({
      ...queryParams,
    });

    response.redirect(googleUrl);
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @UseGuards(AuthGuard)
  @Get("/google/linking/callback")
  async handleGoogleLinkingCallBack(
    @Query(new ZodPipe(HandleGoogleQueryDto))
    queryParams: HandleGoogleQueryDtoType,
    @Res() response: Response,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const returnUrl = validateStateQueryParam(
      request,
      this.envService.get("NODE_ENV"),
      RedirectToGoogleForLinkingDto,
    );

    const url = new URL(returnUrl);
    const errorUrl = new URL(`${returnUrl}/profile`);

    const result = await this.authService.handleGoogleLinkingCallBack(
      "code" in queryParams
        ? {
            ...queryParams,
            type: "success",
            userId: request.user.sub,
          }
        : {
            ...queryParams,
            type: "error",
            userId: request.user.sub,
          },
    );
    if ("error" in result) {
      handleErrorResponse({
        url: errorUrl,
        error: result.error,
        errorDescription: result.errorDescription,
        response,
      });

      return;
    }

    const { accessToken: token } = result;

    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: this.COOKIE_MAX_AGE,
    });

    response.redirect(url.toString());

    return;
  }
}
