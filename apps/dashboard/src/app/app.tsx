import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";
import superjson from "superjson";

import { FallBackRender } from "@/components/errors/error-boundary";
import { NavigationResetWrapper } from "@/components/layout/navigation-reset-wrapper";
import { useExtensionWebsocket } from "@/hooks/use-extension-websocket";
import { ThemeProvider } from "@/providers/theme-provider";
import { TRPCProvider } from "@/utils/trpc";
import { COOKIE_OR_TOKEN_NOT_FOUND_MESSAGE } from "@repo/common/constants";
import { INCOHERENT_DATE_RANGE_ERROR_MESSAGE } from "@repo/common/constants";
import type { AppRouter } from "@repo/trpc/router";
import { ScrollToTopButton } from "@repo/ui/components/scroll-to-top-button";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

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

export const App = () => {
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
          <SidebarProvider>
            <TooltipProvider>
              <ErrorBoundary
                FallbackComponent={({ error, resetErrorBoundary }) => (
                  <FallBackRender
                    error={error}
                    resetErrorBoundary={resetErrorBoundary}
                    hasCustomChildren={false}
                  />
                )}
              >
                <NavigationResetWrapper>
                  <Outlet />
                  <ScrollToTopButton />
                </NavigationResetWrapper>
              </ErrorBoundary>
            </TooltipProvider>
          </SidebarProvider>
        </TRPCProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
};
