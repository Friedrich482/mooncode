import { Mail } from "lucide-react";

import Google from "@/assets/google.svg?react";
import { useTRPC } from "@/utils/trpc";
import { Button } from "@repo/ui/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";

const EmailPasswordOption = ({ email }: { email: string }) => (
  <>
    <Mail />
    <div>
      <p className="font-bold">Email</p>
      <p className="text-sm font-extralight">{email}</p>
    </div>
  </>
);

const GoogleOption = ({ email }: { email: string }) => (
  <>
    <Google aria-hidden="true" className="size-6" />

    <div>
      <p className="font-bold">Google</p>
      <p className="text-sm font-extralight">{email}</p>
    </div>
  </>
);

export const AuthenticationMethods = () => {
  const trpc = useTRPC();
  const {
    data: { email, authMethod },
  } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  return (
    <section className="rounded-md border">
      <div className="flex flex-col items-center justify-start gap-4 p-4">
        <h2 className="w-full text-start text-2xl font-bold">Authentication</h2>
        <p className="w-full text-start">
          Link your account to third-party authentication providers
        </p>

        <div className="flex w-full items-center justify-start gap-3">
          {authMethod === "email" ? (
            <EmailPasswordOption email={email} />
          ) : authMethod === "google" ? (
            <GoogleOption email={email} />
          ) : (
            <>
              <EmailPasswordOption email={email} />
              <GoogleOption email={email} />
            </>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          className="h-10 w-28 rounded-lg"
          disabled={authMethod !== "email"}
        >
          Link Google
        </Button>
      </div>
    </section>
  );
};
