import dotenv from "dotenv";
import path from "path";
import superjson from "superjson";

import { PROD_API_URL } from "@/constants";
import type { AppRouter } from "@repo/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";

import { validateAndRetrieveToken } from "../auth/validate-and-retrieve-token";

// get the API_URL for development,
dotenv.config({ path: path.join(__dirname, "../.env") });

const getApiURL = () => {
  return process.env.API_URL || PROD_API_URL;
};

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getApiURL(),
      async headers() {
        const token = await validateAndRetrieveToken();

        return token
          ? {
              authorization: `Bearer ${token}`,
            }
          : {};
      },
      transformer: superjson,
    }),
  ],
});

export type RouterOutput = inferRouterOutputs<AppRouter>;
