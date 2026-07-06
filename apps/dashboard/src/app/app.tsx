import { useState } from "react";
import { Outlet } from "react-router";
import superjson from "superjson";

import { NavigationResetWrapper } from "@/components/layout/navigation-reset-wrapper";
import { useExtensionWebsocket } from "@/hooks/use-extension-websocket";
import { useSetupOnlineManager } from "@/hooks/use-setup-online-manager";
import { ThemeProvider } from "@/providers/theme-provider";
import { getQueryClient } from "@/utils/query-client";
import { TRPCProvider } from "@/utils/trpc";
import type { AppRouter } from "@repo/trpc/router";
import { ScrollToTopButton } from "@repo/ui/components/scroll-to-top-button";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

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
  useSetupOnlineManager();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <SidebarProvider>
            <TooltipProvider>
              <NavigationResetWrapper>
                <Outlet />
                <ScrollToTopButton />
              </NavigationResetWrapper>
            </TooltipProvider>
          </SidebarProvider>
        </TRPCProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
};
