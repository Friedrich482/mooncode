import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@/common/constants";
import { EnvService } from "@/env/env.service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadSchema as JwtPayloadDto } from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from "@trpc-limiter/memory";

import { TrpcInstance } from "./providers/providers";
import { RateLimiterParams, TrpcContext } from "./trpc.dto";

@Injectable()
export class TrpcService {
  private readonly logger = new Logger("TrpcService", { timestamp: true });

  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,

    @Inject("trpc")
    readonly trpc: TrpcInstance,

    @Inject("limiters")
    private readonly limiters: Map<
      string,
      ReturnType<typeof createTRPCStoreLimiter<typeof trpc>>
    >,
  ) {}

  rateLimiter(rateLimiterParams: RateLimiterParams) {
    const { key, windowMs = 15 * 60 * 1000, max = 600 } = rateLimiterParams;

    const cacheKey = `${key}-${windowMs}-${max}`;

    if (!this.limiters.has(cacheKey)) {
      this.limiters.set(
        cacheKey,
        createTRPCStoreLimiter<typeof this.trpc>({
          fingerprint: (ctx) => defaultFingerPrint(ctx.req),
          windowMs,
          max,

          onLimit: (retryAfter) => {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Too many requests, please try again in ${retryAfter} seconds`,
            });
          },
        }),
      );
    }

    return this.limiters.get(cacheKey)!;
  }

  // these routes are publicly accessible to everyone
  publicProcedure(rateLimiterParams?: RateLimiterParams) {
    return this.trpc.procedure.use(
      this.rateLimiter(rateLimiterParams ?? { key: "global" }),
    );
  }

  // these routes requires authentication
  protectedProcedure(rateLimiterParams?: RateLimiterParams) {
    const procedure = this.trpc.procedure
      .use(async (opts) => {
        const payload = await this.getPayload(opts.ctx);

        return opts.next({
          ctx: {
            ...opts.ctx,
            user: { sub: payload.sub },
          },
        });
      })
      .use(this.rateLimiter(rateLimiterParams ?? { key: "global" }));
    return procedure;
  }

  async getPayload(ctx: TrpcContext) {
    // get jwt token from cookies (browser) or the headers (extension)
    const accessToken =
      ctx.req.cookies?.auth_token ??
      ctx.req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE,
      });
    }

    const clientIpAddress =
      this.envService.get("NODE_ENV") === "development"
        ? ctx.req.ip
        : // the api may be behind proxies in production
          // it is actually proxied by cloudflare
          (ctx.req.headers["cf-connecting-ip"]
            ?.toString()
            .split(",")[0]
            .trim() ?? ctx.req.socket.remoteAddress);

    try {
      const rawPayload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.envService.get("JWT_SECRET"),
      });

      const parsedPayload = JwtPayloadDto.safeParse(rawPayload);

      if (!parsedPayload.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payload malformed",
        });
      }

      const payload = parsedPayload.data;

      this.logger.log(
        `${ctx.req.method} ${decodeURIComponent(ctx.req.originalUrl)} - userId: ${payload.sub}, ${clientIpAddress}`,
      );

      return payload;
    } catch (error) {
      this.logger.error(
        `${ctx.req.method} ${decodeURIComponent(ctx.req.originalUrl)} - JWT verification failed on jwt: "${accessToken}", ${clientIpAddress}`,
        error instanceof Error ? error.stack : error,
      );

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  }
}
