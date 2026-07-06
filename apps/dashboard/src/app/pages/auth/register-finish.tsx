import Night from "@/assets/animated-night.svg?react";
import { RegisterFinishForm } from "@/features/auth/components/register-finish-form";
import { usePageTitle } from "@/hooks/use-page-title";

export const RegisterFinish = () => {
  usePageTitle("Register | MoonCode");

  return (
    <main className="flex min-h-dvh gap-2">
      <div className="relative w-1/2 max-[42.5rem]:hidden">
        <Night className="absolute h-full" />
      </div>

      <div className="flex w-1/2 items-center justify-center max-[42.5rem]:w-full">
        <RegisterFinishForm />
      </div>
    </main>
  );
};
