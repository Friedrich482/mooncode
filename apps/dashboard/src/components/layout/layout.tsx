import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useNavigation } from "react-router";
import { ClipLoader } from "react-spinners";

import { cn } from "@repo/ui/lib/utils";

import { FallBackRender } from "../errors/error-boundary";
import { SuspenseBoundary } from "../errors/suspense-boundary";
import { AppSidebar } from "./app-sidebar/app-sidebar";
import { AppSidebarError } from "./app-sidebar/app-sidebar-error";
import { AppSidebarSkeleton } from "./app-sidebar/app-sidebar-skeleton";
import { Footer } from "./footer";
import { Header } from "./header/header";

const GlobalSpinner = () => (
  <div className="flex h-dvh items-center justify-center">
    <ClipLoader size={80} color="var(--primary)" />
  </div>
);

export const Layout = () => {
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  return (
    <>
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

      <div className="flex-1">
        <Header />
        <div id="loader" className={cn(isLoading && "opacity-70")}>
          {isLoading && <GlobalSpinner />}
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};
