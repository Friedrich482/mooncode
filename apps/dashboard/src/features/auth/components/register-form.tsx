import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Logo } from "@/components/layout/header/logo";
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
import { Input } from "@repo/ui/components/ui/input";
import { useMutation } from "@tanstack/react-query";

import { RegisterFormSchema, RegisterFormSchemaType } from "../types-schemas";
import { GoogleLoginButton } from "./google-login-button";
import { LoginMethodSeparator } from "./login-method-separator";

export const RegisterForm = () => {
  const callbackUrl = getCallbackUrl();

  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const navigate = useNavigate();
  const trpc = useTRPC();
  const createEmailVerificationMutation = useMutation(
    trpc.auth.createEmailVerification.mutationOptions(),
  );

  const onSubmit = async (values: RegisterFormSchemaType) => {
    createEmailVerificationMutation.mutate(
      {
        email: values.email,
        type: "onboarding",
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("email")) {
            form.setError("email", { message: errorMessage });
          } else {
            form.setError("root", { message: errorMessage });
          }
        },

        onSuccess: async ({ verificationToken, message }) => {
          toast.success(message);

          const params = new URLSearchParams();

          params.set("verification-token", verificationToken);

          if (callbackUrl) {
            params.set("callback", callbackUrl);
          }

          navigate(`/register/verify?${params.toString()}`);
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
        <GoogleLoginButton callbackUrl={callbackUrl} />
        <LoginMethodSeparator />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example@email.com"
                  {...field}
                  className="border-border h-10"
                />
              </FormControl>
              <FormDescription>
                Please enter your email address, we will send you an email with
                a code to verify your identity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <p>
          Already registered?{" "}
          <Link
            to={`/login${callbackUrl ? `?callback=${callbackUrl}` : ""}`}
            className="underline"
          >
            Log in
          </Link>
        </p>
        <Button
          variant="default"
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-10 w-1/2 self-center rounded-lg"
        >
          Submit
        </Button>
        <div className="h-4">
          {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
        </div>
      </form>
    </Form>
  );
};
