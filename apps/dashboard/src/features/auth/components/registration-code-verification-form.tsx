import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";

import { Logo } from "@/components/layout/header/logo";
import { emailVerificationLoader } from "@/loaders/email-verification-loader";
import { getCallbackUrl } from "@/utils/get-callback-url";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { cn } from "@repo/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";

import {
  VerifyEmailVerificationCodeFormSchema,
  VerifyEmailVerificationCodeFormSchemaType,
} from "../types-schemas";

export const CodeVerificationForm = () => {
  const callbackUrl = getCallbackUrl();

  const verificationToken = useLoaderData<typeof emailVerificationLoader>();

  const form = useForm<VerifyEmailVerificationCodeFormSchemaType>({
    resolver: zodResolver(VerifyEmailVerificationCodeFormSchema),
    defaultValues: {
      code: "",
    },
  });
  useEffect(() => {
    form.setFocus("code");
  }, []);

  const navigate = useNavigate();
  const trpc = useTRPC();
  const verifyEmailVerificationCodeMutation = useMutation(
    trpc.auth.verifyEmailVerificationCode.mutationOptions(),
  );

  const onSubmit = (values: VerifyEmailVerificationCodeFormSchemaType) => {
    verifyEmailVerificationCodeMutation.mutate(
      {
        code: values.code,
        id: verificationToken,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("code")) {
            form.setError("code", { message: errorMessage });
          } else {
            form.setError("root", { message: errorMessage });
          }
        },

        onSuccess: ({ message }) => {
          toast.success(message);

          const params = new URLSearchParams();

          params.set("verification-token", verificationToken);

          if (callbackUrl) {
            params.set("callback", callbackUrl);
          }

          navigate(`/register/finish?${params.toString()}`);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-[90%] flex-col gap-4 p-2"
      >
        <h2 className="flex flex-col items-center justify-center gap-2 text-center text-3xl font-extrabold max-[42.5rem]:text-2xl">
          <Logo className="size-12" />
          Register
        </h2>
        <section className="flex w-full flex-1 flex-col items-start gap-8 pt-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="place-content-center">
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={8} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Enter the 8-digit code we sent you by email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full gap-5">
            <Button
              variant="secondary"
              type="button"
              asChild
              className={cn("h-10 w-1/2 self-start rounded-lg")}
            >
              <Link
                to={`/register${callbackUrl ? `?callback=${callbackUrl}` : ""}`}
              >
                Back
              </Link>
            </Button>
            <Button
              variant="default"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-10 w-1/2 self-start rounded-lg"
            >
              Verify
            </Button>
          </div>
          <div className="h-4">
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}
          </div>
        </section>
      </form>
    </Form>
  );
};
