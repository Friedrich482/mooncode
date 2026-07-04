import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Link } from "react-router";
import superjson from "superjson";

import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";
import { AppSidebar } from "@/components/layout/app-sidebar/app-sidebar";
import { AppSidebarError } from "@/components/layout/app-sidebar/app-sidebar-error";
import { AppSidebarSkeleton } from "@/components/layout/app-sidebar/app-sidebar-skeleton";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/header";
import { NavigationResetWrapper } from "@/components/layout/navigation-reset-wrapper";
import { ThemeProvider } from "@/providers/theme-provider";
import { getQueryClient } from "@/utils/query-client";
import { TRPCProvider } from "@/utils/trpc";
import { type AppRouter } from "@repo/trpc/router";
import { ScrollToTopButton } from "@repo/ui/components/scroll-to-top-button";
import { Button } from "@repo/ui/components/ui/button";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const AppErrorBoundary = () => {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
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

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <SidebarProvider className="flex-1">
            <TooltipProvider>
              <NavigationResetWrapper>
                <ErrorBoundary
                  FallbackComponent={({ error, resetErrorBoundary }) => (
                    <FallBackRender
                      error={error}
                      resetErrorBoundary={resetErrorBoundary}
                      hasCustomChildren={true}
                      customChildren={(errorMessage) => (
                        <AppSidebarError errorMessage={errorMessage} />
                      )}
                    />
                  )}
                >
                  <SuspenseBoundary
                    hasCustomSkeleton={true}
                    skeleton={<AppSidebarSkeleton />}
                  >
                    <AppSidebar />
                  </SuspenseBoundary>
                </ErrorBoundary>

                <div className="flex flex-1 flex-col">
                  <Header />
                  <main className="flex flex-1 flex-col items-center justify-center gap-y-12 pt-2 pr-14 pb-4 pl-1 max-md:pl-14">
                    <h2 className="text-5xl">An error occurred</h2>
                    <Button asChild className="w-44">
                      <Link to="/dashboard">Go Home</Link>
                    </Button>
                  </main>
                  <Footer />
                </div>
                <ScrollToTopButton />
              </NavigationResetWrapper>
            </TooltipProvider>
          </SidebarProvider>
        </TRPCProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
