import { Request, Response } from "express";
import { ZodPipe } from "src/pipes/zod.pipe";

import { Controller, Get, Query, Req, Res } from "@nestjs/common";

import {
  HandleGoogleQueryDto,
  HandleGoogleQueryDtoType,
  RedirectToGoogleDtoType,
} from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("/google")
  redirectToGoogle(
    @Res() response: Response,
    @Query() queryParams: Omit<RedirectToGoogleDtoType, "request" | "response">
  ) {
    return this.authService.redirectToGoogle({
      ...queryParams,
      response,
    });
  }

  @Get("/google/callback")
  handleGoogleCallBack(
    @Query(new ZodPipe(HandleGoogleQueryDto))
    queryParams: HandleGoogleQueryDtoType,
    @Res() response: Response,
    @Req() request: Request
  ) {
    if ("code" in queryParams) {
      return this.authService.handleGoogleCallBack({
        ...queryParams,
        type: "success",
        request,
        response,
      });
    } else {
      return this.authService.handleGoogleCallBack({
        ...queryParams,
        type: "error",
        request,
        response,
      });
    }
  }
}
