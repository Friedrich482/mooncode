import superjson from "superjson";

import type { AppRouter } from "@repo/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";

type RouterOutput = inferRouterOutputs<AppRouter>;

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export { type RouterOutput };

export const trpcLoaderClient = createTRPCClient<AppRouter>({
  links: [
    // trpc reads the http only cookie
    httpBatchLink({
      url: import.meta.env.VITE_API_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      transformer: superjson,
    }),
  ],
});
