import { Link } from "react-router";
import { Mail } from "lucide-react";

import Google from "@/assets/google.svg?react";
import { useTRPC } from "@/utils/trpc";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { useSuspenseQuery } from "@tanstack/react-query";

const EmailPasswordOption = ({ email }: { email: string }) => (
  <div className="flex w-full items-center justify-start gap-3">
    <Mail />
    <div>
      <p className="font-bold">Email + Password</p>
      <p className="text-sm font-extralight">{email}</p>
    </div>
  </div>
);

const GoogleOption = ({ email }: { email: string }) => (
  <div className="flex w-full items-center justify-start gap-3">
    <Google aria-hidden="true" className="size-6" />

    <div>
      <p className="font-bold">Google</p>
      <p className="text-sm font-extralight">{email}</p>
    </div>
  </div>
);

export const AuthenticationMethods = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  return (
    <section className="rounded-md border">
      <div className="flex flex-col items-center justify-start gap-4 p-4">
        <h2 className="w-full text-start text-2xl font-bold">Authentication</h2>
        <p className="w-full text-start">
          Link your account to third-party authentication providers
        </p>

        {data.authMethod === "email" ? (
          <EmailPasswordOption email={data.email} />
        ) : data.authMethod === "google" ? (
          <GoogleOption email={data.email} />
        ) : data.authMethod === "both" ? (
          <>
            <EmailPasswordOption email={data.email} />
            <Separator className="w-1/2! place-self-start" />
            <GoogleOption email={data.googleEmail} />
          </>
        ) : null}
      </div>

      <div className="border-t p-4">
        <Button
          className="h-10 w-28 rounded-lg"
          disabled={data.authMethod !== "email"}
        >
          <Link
            to="/auth/google/linking"
            className="flex items-center gap-2"
            aria-label="Link Google Account"
          >
            <span> Link Google</span>
          </Link>
        </Button>
      </div>
    </section>
  );
};
