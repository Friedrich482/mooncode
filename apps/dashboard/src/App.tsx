import { useState } from "react";
import { Outlet } from "react-router";
import superjson from "superjson";

import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@repo/common/constants";
import { INCOHERENT_DATE_RANGE_ERROR_MESSAGE } from "@repo/common/constants";
import type { AppRouter } from "@repo/trpc/router";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { ThemeProvider } from "@repo/ui/providers/themeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import useExtensionWebsocket from "./hooks/useExtensionWebsocket";
import { TRPCProvider } from "./utils/trpc";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 60 * 1000,
        retry: (failureCount, error) => {
          try {
            if (
              error.message === COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE ||
              error.message !== INCOHERENT_DATE_RANGE_ERROR_MESSAGE
            ) {
              return failureCount < 1;
            }

            const parsedErrors =
              typeof error.message === "string"
                ? JSON.parse(error.message)
                : error.message;

            if (Array.isArray(parsedErrors)) {
              const errorMessage: string = parsedErrors.map(
                (err) => err.message,
              )[0];
              if (errorMessage === INCOHERENT_DATE_RANGE_ERROR_MESSAGE) {
                return failureCount < 1;
              }
            }

            return failureCount < 0;
          } catch (error) {
            console.error(error);
            return failureCount < 3;
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function App() {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
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
    }),
  );

  useExtensionWebsocket();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <Outlet />
        </TRPCProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
