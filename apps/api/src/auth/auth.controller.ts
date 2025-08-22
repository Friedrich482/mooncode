import { Controller, Get, Query } from "@nestjs/common";
import {
  HandleGoogleCallBacKDto,
  HandleGoogleCallBacKDtoType,
} from "./auth.dto";
import { AuthService } from "./auth.service";
import { ZodPipe } from "src/pipes/zod.pipe";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("/google/callback")
  handleGoogleCallBack(
    @Query(new ZodPipe(HandleGoogleCallBacKDto))
    queryParams: HandleGoogleCallBacKDtoType,
  ) {
    return this.authService.handleGoogleCallBack(queryParams);
  }
}
