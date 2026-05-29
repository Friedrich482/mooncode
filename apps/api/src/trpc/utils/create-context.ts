import * as trpcExpress from "@trpc/server/adapters/express";

import { TrpcContext } from "../trpc.dto";

export const createContext = async (
  opts: trpcExpress.CreateExpressContextOptions,
): Promise<TrpcContext> => ({
  req: opts.req,
  res: opts.res,
});
