import superjson from "superjson";

import { EnvService } from "@/env/env.service";
import { Provider } from "@nestjs/common";
import { initTRPC } from "@trpc/server";
import { createTRPCStoreLimiter } from "@trpc-limiter/memory";

import { errorFormatter } from "../filters/error-formatter";
import { TrpcContext } from "../trpc.dto";

const trpcProvider = {
  provide: "trpc",
  useFactory: (envService: EnvService) => {
    const trpc = initTRPC.context<TrpcContext>().create({
      transformer: superjson,
      errorFormatter: ({ error, shape }) =>
        errorFormatter({
          environment: envService.get("NODE_ENV"),
          error,
          shape,
        }),
    });

    return trpc;
  },
  inject: [EnvService],
} satisfies Provider;

export type TrpcInstance = ReturnType<(typeof trpcProvider)["useFactory"]>;

const limitersProvider = {
  provide: "limiters",
  useFactory: () => {
    const limiters = new Map<
      string,
      ReturnType<typeof createTRPCStoreLimiter<TrpcInstance>>
    >();

    return limiters;
  },
  inject: ["trpc"],
} satisfies Provider;

export const providers = [trpcProvider, limitersProvider];
