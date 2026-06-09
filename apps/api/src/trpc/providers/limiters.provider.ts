import { createTRPCStoreLimiter } from "@trpc-limiter/memory";

import { LIMITERS_PROVIDER } from "../constants";
import { TrpcInstance } from "./trpc.provider";

export const limitersProvider = {
  provide: LIMITERS_PROVIDER,
  useFactory: () => {
    const limiters = new Map<
      string,
      ReturnType<typeof createTRPCStoreLimiter<TrpcInstance>>
    >();

    return limiters;
  },
};
