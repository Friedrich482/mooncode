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
    <main className="flex items-center gap-2">
      <Night className="relative flex size-full h-dvh w-[50%] max-[42.5rem]:hidden" />

      <div className="flex h-dvh w-[50%] items-center justify-center max-[42.5rem]:w-full">
        <LoginForm />
      </div>
    </main>
  );
};
