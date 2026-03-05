import { EnvService } from "src/env/env.service";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@repo/common/constants";
import { JwtPayload as JwtPayloadDtoType } from "@repo/common/types-schemas";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.auth_token ?? "";

    if (!token) {
      throw new UnauthorizedException(COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE);
    }

    try {
      const payload: JwtPayloadDtoType = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.envService.get("JWT_SECRET"),
        },
      );
      request["user"] = { sub: payload.sub };
    } catch {
      throw new UnauthorizedException("An error occurred");
    }
    return true;
  }
}
