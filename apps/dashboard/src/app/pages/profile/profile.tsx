import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";
import { displayAuthErrorSonner } from "@/features/auth/utils/display-auth-error-sonner";
import { AuthenticationMethods } from "@/features/profile/components/authentication-methods";
import { AvatarSection } from "@/features/profile/components/avatar-section";
import { CreateEmailUpdateForm } from "@/features/profile/components/create-email-update-form";
import { SomeStats } from "@/features/profile/components/some-stats";
import { UpdateUsernameForm } from "@/features/profile/components/update-username-form";
import { usePageTitle } from "@/hooks/use-page-title";

export const Profile = () => {
  usePageTitle("Profile | MoonCode");

  useEffect(() => {
    displayAuthErrorSonner();
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-y-4 pt-2 pr-14 pb-4 pl-1 max-md:pl-14">
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <FallBackRender
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            hasCustomChildren={false}
            className="text-destructive z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
          />
        )}
      >
        <SuspenseBoundary hasCustomSkeleton={false} className="h-32">
          <AvatarSection />
        </SuspenseBoundary>
      </ErrorBoundary>

      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <FallBackRender
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            hasCustomChildren={false}
            className="text-destructive z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
          />
        )}
      >
        <SuspenseBoundary hasCustomSkeleton={false} className="h-58">
          <UpdateUsernameForm />
        </SuspenseBoundary>
      </ErrorBoundary>

      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <FallBackRender
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            hasCustomChildren={false}
            className="text-destructive z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
          />
        )}
      >
        <SuspenseBoundary hasCustomSkeleton={false} className="h-58">
          <CreateEmailUpdateForm />
        </SuspenseBoundary>
      </ErrorBoundary>

      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <FallBackRender
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            hasCustomChildren={false}
            className="text-destructive z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
          />
        )}
      >
        <SuspenseBoundary hasCustomSkeleton={false} className="h-79">
          <AuthenticationMethods />
        </SuspenseBoundary>
      </ErrorBoundary>

      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <FallBackRender
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            hasCustomChildren={false}
            className="text-destructive z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
          />
        )}
      >
        <SuspenseBoundary hasCustomSkeleton={false} className="h-300">
          <SomeStats />
        </SuspenseBoundary>
      </ErrorBoundary>
    </main>
  );
};
