import superjson from "superjson";

import { TrpcContext } from "@/common/dto";
import { EnvService } from "@/env/env.service";
import { initTRPC } from "@trpc/server";

import { TRPC_PROVIDER } from "../constants";
import { errorFormatter } from "../filters/error-formatter";

export const trpcProvider = {
  provide: TRPC_PROVIDER,
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
};

export type TrpcInstance = ReturnType<(typeof trpcProvider)["useFactory"]>;
