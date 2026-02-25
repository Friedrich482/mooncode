import { Request, Response } from "express";
import { ZodPipe } from "src/common/pipes/zod.pipe";

import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import {
  HandleGoogleQueryDto,
  HandleGoogleQueryDtoType,
  RedirectToGoogleDtoType,
  RedirectToGoogleForLinkingDtoType,
} from "./auth.dto";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @Get("/google")
  redirectToGoogle(
    @Res() response: Response,
    @Query() queryParams: Omit<RedirectToGoogleDtoType, "response">,
  ) {
    return this.authService.redirectToGoogle({
      ...queryParams,
      response,
    });
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @Get("/google/callback")
  handleGoogleCallBack(
    @Query(new ZodPipe(HandleGoogleQueryDto))
    queryParams: HandleGoogleQueryDtoType,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    if ("code" in queryParams) {
      return this.authService.handleGoogleCallBack({
        ...queryParams,
        type: "success",
        request,
        response,
      });
    }

    return this.authService.handleGoogleCallBack({
      ...queryParams,
      type: "error",
      request,
      response,
    });
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @UseGuards(AuthGuard)
  @Get("/google/linking")
  redirectToGoogleForLinking(
    @Res() response: Response,
    @Query()
    queryParams: Omit<RedirectToGoogleForLinkingDtoType, "response">,
  ) {
    return this.authService.redirectToGoogleForLinking({
      ...queryParams,
      response,
    });
  }

  @Throttle({ default: { limit: 30, blockDuration: 5 * 60 * 1000 } })
  @UseGuards(AuthGuard)
  @Get("/google/linking/callback")
  handleGoogleLinkingCallBack(
    @Query(new ZodPipe(HandleGoogleQueryDto))
    queryParams: HandleGoogleQueryDtoType,
    @Res() response: Response,
    @Req() request: Request & { user: { sub: string } },
  ) {
    if ("code" in queryParams) {
      return this.authService.handleGoogleLinkingCallBack({
        ...queryParams,
        type: "success",
        request,
        response,
      });
    }

    return this.authService.handleGoogleLinkingCallBack({
      ...queryParams,
      type: "error",
      request,
      response,
    });
  }
}
