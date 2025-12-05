import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Night from "@/assets/animated-night.svg?react";
import Logo from "@/components/layout/header/Logo";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import usePageTitle from "@/hooks/usePageTitle";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreatePendingRegistrationDto,
  CreatePendingRegistrationDtoType,
} from "@repo/common/types-schemas";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { useMutation } from "@tanstack/react-query";

import GoogleLoginButton from "../GoogleLoginButton";
import LoginMethodSeparator from "../LoginMethodSeparator";

const RegisterForm = () => {
  usePageTitle("Register | Mooncode");

  const form = useForm<CreatePendingRegistrationDtoType>({
    resolver: zodResolver(CreatePendingRegistrationDto),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const { isPasswordVisible, EyeIconComponent } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const createPendingRegistrationMutation = useMutation(
    trpc.pendingRegistrations.create.mutationOptions(),
  );

  const callbackUrl = getCallbackUrl();

  const onSubmit = async (values: CreatePendingRegistrationDtoType) => {
    createPendingRegistrationMutation.mutate(
      {
        email: values.email,
        username: values.username,
        password: values.password,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("email")) {
            form.setError("email", { message: errorMessage });
          } else if (errorMessage.toLowerCase().includes("username")) {
            form.setError("username", { message: errorMessage });
          } else {
            form.setError("root", { message: errorMessage });
          }
        },

        onSuccess: async ({ email }) => {
          localStorage.setItem("pendingRegistrationEmail", email);

          navigate("/register/verify");
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example"
                      {...field}
                      className="border-border h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative flex items-center justify-end gap-2">
                      <FormControl>
                        <Input
                          placeholder="**********"
                          {...field}
                          type={isPasswordVisible ? "text" : "password"}
                          className="border-border h-10 flex-nowrap"
                        />
                      </FormControl>
                      <EyeIconComponent />
                    </div>
                    <FormMessage />
                  </FormItem>
                </>
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
              Register
            </Button>
            <div className="h-4">
              {form.formState.errors.root && (
                <FormMessage>{form.formState.errors.root.message}</FormMessage>
              )}
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default RegisterForm;
