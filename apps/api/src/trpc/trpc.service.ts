import superjson from "superjson";
import { EnvService } from "src/env/env.service";
import { errorFormatter } from "src/trpc/filters/errorFormatter";

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@repo/common/constants";
import { JwtPayloadDtoType } from "@repo/common/types-schemas";
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

export type TrpcContext = {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  user?: Pick<JwtPayloadDtoType, "sub">;
};

export const createContext = async (
  opts: trpcExpress.CreateExpressContextOptions
): Promise<TrpcContext> => {
  return {
    req: opts.req,
    res: opts.res,
  };
};

@Injectable()
export class TrpcService {
  trpc;
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService
  ) {
    this.trpc = initTRPC.context<TrpcContext>().create({
      transformer: superjson,
      errorFormatter: ({ error, shape }) =>
        errorFormatter(this.envService, { error, shape }),
    });
  }

  // these routes are publicly accessible to everyone
  publicProcedure() {
    return this.trpc.procedure;
  }

  // these routes requires authentication:

  protectedProcedure() {
    const procedure = this.trpc.procedure.use(async (opts) => {
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
    });
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
        }
      );
      return payload;
    } catch (error) {
      if (error instanceof Error && error.name !== "JsonWebTokenError") {
        console.error("Unexpected Error:", error);
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "An error occurred",
      });
    }
  }
}
