import Night from "@/assets/animated-night.svg?react";
import usePageTitle from "@/hooks/usePageTitle";

import RegisterForm from "./RegisterForm";

const Register = () => {
  usePageTitle("Register | Mooncode");

  return (
    <main className="flex items-center gap-2">
      <Night className="relative flex size-full h-dvh w-[50%] max-[42.5rem]:hidden" />

      <div className="flex h-dvh w-[50%] items-center justify-center max-[42.5rem]:w-full">
        <RegisterForm />
      </div>
    </main>
  );
};

export default Register;
