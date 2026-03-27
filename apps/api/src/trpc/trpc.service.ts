import superjson from "superjson";
import { EnvService } from "src/env/env.service";
import { errorFormatter } from "src/trpc/filters/error-formatter";

import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@repo/common/constants";
import { JwtPayload as JwtPayloadDtoType } from "@repo/common/types-schemas";
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from "@trpc-limiter/memory";

import { RateLimiterParams } from "./trpc.dto";

export type TrpcContext = {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  user?: Pick<JwtPayloadDtoType, "sub">;
};

export const createContext = async (
  opts: trpcExpress.CreateExpressContextOptions,
): Promise<TrpcContext> => {
  return {
    req: opts.req,
    res: opts.res,
  };
};

@Injectable()
export class TrpcService {
  trpc;
  private limiters;
  private readonly logger = new Logger("TrpcService", { timestamp: true });
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {
    this.trpc = initTRPC.context<TrpcContext>().create({
      transformer: superjson,
      errorFormatter: ({ error, shape }) =>
        errorFormatter(this.envService, { error, shape }),
    });
    this.limiters = new Map<
      string,
      ReturnType<typeof createTRPCStoreLimiter<typeof this.trpc>>
    >();
  }

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

        if (!payload) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // user is authorized
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
      (ctx.req.headers.authorization?.replace("Bearer ", "") || "");

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE,
      });
    }

    try {
      const payload: JwtPayloadDtoType = await this.jwtService.verifyAsync(
        accessToken,
        {
          secret: this.envService.get("JWT_SECRET"),
        },
      );

      this.logger.log(
        `${ctx.req.method} ${decodeURIComponent(ctx.req.originalUrl)} - userId: ${payload.sub}`,
      );

      return payload;
    } catch (error) {
      this.logger.error(
        `${ctx.req.method} ${decodeURIComponent(ctx.req.originalUrl)} - JWT verification failed`,
        error instanceof Error ? error.stack : error,
      );

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "An error occurred",
      });
    }
  }
}
