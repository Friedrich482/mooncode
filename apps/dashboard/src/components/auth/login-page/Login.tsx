import { useEffect } from "react";

import Night from "@/assets/animated-night.svg?react";
import usePageTitle from "@/hooks/usePageTitle";
import displayAuthErrorSonner from "@/utils/displayAuthErrorSonner";

import LoginForm from "./LoginForm";

const Login = () => {
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

export default Login;
