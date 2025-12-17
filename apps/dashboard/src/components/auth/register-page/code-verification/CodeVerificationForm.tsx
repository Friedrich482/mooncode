import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router";

import Night from "@/assets/animated-night.svg?react";
import Logo from "@/components/layout/header/Logo";
import getCallbackUrl from "@/utils/getCallbackUrl";
import pendingRegistrationLoader from "@/utils/loader/pendingRegistrationLoader";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterUserDto,
  RegisterUserDtoType,
} from "@repo/common/types-schemas";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CodeVerificationForm = () => {
  const pendingRegistrationEmail =
    useLoaderData<typeof pendingRegistrationLoader>();

  const callbackUrl = getCallbackUrl();

  const form = useForm<RegisterUserDtoType>({
    resolver: zodResolver(RegisterUserDto),
    defaultValues: {
      email: pendingRegistrationEmail,
      code: "",
      callbackUrl,
    },
  });
  useEffect(() => {
    form.setFocus("code");
  }, []);

  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const registerMutation = useMutation(
    trpc.auth.registerUser.mutationOptions(),
  );

  const onSubmit = async (values: RegisterUserDtoType) => {
    registerMutation.mutate(
      {
        email: pendingRegistrationEmail,
        code: values.code,
        callbackUrl,
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

        onSuccess: async ({ accessToken }) => {
          await queryClient.invalidateQueries({
            queryKey: trpc.auth.getUser.queryKey(),
            exact: true,
          });

          navigate("/dashboard");

          if (callbackUrl && accessToken) {
            window.location.href = `${callbackUrl}&token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(pendingRegistrationEmail)}`;
          }
        },
      },
    );
  };

  return (
    <main className="flex items-center gap-2">
      <Night className="relative flex size-full h-dvh w-[50%] max-[42.5rem]:hidden" />

      <div className="flex h-dvh w-[50%] items-center justify-center max-[42.5rem]:w-full">
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
                  <FormMessage>
                    {form.formState.errors.root.message}
                  </FormMessage>
                )}
              </div>
            </section>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default CodeVerificationForm;
