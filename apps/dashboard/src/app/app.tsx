import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";
import superjson from "superjson";

import { FallBackRender } from "@/components/errors/error-boundary";
import { NavigationResetWrapper } from "@/components/layout/navigation-reset-wrapper";
import { useExtensionWebsocket } from "@/hooks/use-extension-websocket";
import { ThemeProvider } from "@/providers/theme-provider";
import { isTRPCClientError, TRPCProvider } from "@/utils/trpc";
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
          if (isTRPCClientError(error)) {
            return failureCount < 1;
          }

          return failureCount < 3;
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
