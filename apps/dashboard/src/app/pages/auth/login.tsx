import { useEffect } from "react";

import Night from "@/assets/animated-night.svg?react";
import { LoginForm } from "@/features/auth/components/login-form";
import { displayAuthErrorSonner } from "@/features/auth/utils/display-auth-error-sonner";
import { usePageTitle } from "@/hooks/use-page-title";

export const Login = () => {
  usePageTitle("Login | MoonCode");

  useEffect(() => {
    displayAuthErrorSonner();
  }, []);

  return (
    <main className="flex min-h-dvh gap-2">
      <div className="relative w-1/2 max-[42.5rem]:hidden">
        <Night className="absolute h-full" />
      </div>

      <div className="flex w-1/2 items-center justify-center max-[42.5rem]:w-full">
        <LoginForm />
      </div>
    </main>
  );
};
