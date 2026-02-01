import { useEffect } from "react";

import Night from "@/assets/animated-night.svg?react";
import { usePageTitle } from "@/hooks/use-page-title";
import { displayAuthErrorSonner } from "@/utils/display-auth-error-sonner";

import { LoginForm } from "./login-form";

export const Login = () => {
  usePageTitle("Login | Mooncode");

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
