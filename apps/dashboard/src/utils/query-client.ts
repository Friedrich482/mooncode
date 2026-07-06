import { QueryClient } from "@tanstack/react-query";

import { isTRPCClientError } from "./trpc";

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 60 * 1000,
        retry: (failureCount, error) => {
          if (isTRPCClientError(error)) {
            return failureCount < 1;
          }

          return failureCount < 3;
        },
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
  }
};
