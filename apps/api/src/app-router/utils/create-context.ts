import { TrpcContext } from "@/common/dto";
import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = async (
  opts: trpcExpress.CreateExpressContextOptions,
): Promise<TrpcContext> => ({
  req: opts.req,
  res: opts.res,
});
