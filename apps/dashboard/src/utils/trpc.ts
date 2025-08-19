import type { AppRouter } from "@repo/trpc/router";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export { type RouterOutput };
