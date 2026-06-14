import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@/common/constants";
import { EnvService } from "@/env/env.service";
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadSchema as JwtPayloadDto } from "@repo/common/types-schemas";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.auth_token;

    if (!token) {
      throw new UnauthorizedException(COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE);
    }

    let rawPayload: unknown;
    try {
      rawPayload = await this.jwtService.verifyAsync(token, {
        secret: this.envService.get("JWT_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const parsedPayload = JwtPayloadDto.safeParse(rawPayload);

    if (!parsedPayload.success) {
      throw new BadRequestException("Payload malformed");
    }

    const payload = parsedPayload.data;

    request["user"] = { sub: payload.sub };

    return true;
  }
}
