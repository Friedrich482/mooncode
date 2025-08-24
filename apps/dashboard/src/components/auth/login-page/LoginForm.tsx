import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  INCORRECT_PASSWORD_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "@repo/common/constants";
import { Link, useNavigate } from "react-router";
import { Button } from "@repo/ui/components/ui/button";
import GoogleLoginButton from "../GoogleLoginButton";
import { Input } from "@repo/ui/components/ui/input";
import LoginMethodSeparator from "../LoginMethodSeparator";
import Logo from "../../layout/header/Logo";
import Night from "@/assets/animated-night.svg?react";
import { SignInUserDto } from "@repo/common/schemas";
import { SignInUserDtoType } from "@repo/common/types";
import displayAuthErrorSonner from "@/utils/displayAuthErrorSonner";
import fetchJWTToken from "@repo/common/fetchJWTToken";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import usePageTitle from "@/hooks/usePageTitle";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginForm = () => {
  usePageTitle("Login");

  useEffect(() => {
    displayAuthErrorSonner();
  }, []);

  // remove the padding-top on the root div
  useEffect(() => {
    document.getElementById("root")?.classList.add("auth-root");
    return () => {
      document.getElementById("root")?.classList.remove("auth-root");
    };
  }, []);

  const form = useForm<SignInUserDtoType>({
    resolver: zodResolver(SignInUserDto),
    defaultValues: {
      email: "",
      password: "",
      callbackUrl: null,
    },
  });

  const { isPasswordVisible, EyeIconComponent } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const callbackUrl = getCallbackUrl();

  const onSubmit = async (values: SignInUserDtoType) => {
    try {
      // send the credentials to the backend and set an http cookie in the browser
      const LOGIN_URL = import.meta.env.VITE_LOGIN_URL;

      const token = await fetchJWTToken(LOGIN_URL, {
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (callbackUrl) {
        window.location.href = `${callbackUrl}&token=${token}&email=${encodeURIComponent(values.email)}`;
      }

      await queryClient.invalidateQueries({
        queryKey: trpc.auth.getUser.queryKey(),
        exact: true,
      });

      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "An error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage === INCORRECT_PASSWORD_MESSAGE) {
        form.setError("password", { message: errorMessage });
      } else if (errorMessage === USER_NOT_FOUND_MESSAGE) {
        form.setError("email", { message: errorMessage });
      } else {
        form.setError("root", { message: errorMessage });
      }
    }
  };

  return (
    <main className="flex items-center gap-2">
      <Night className="relative flex size-full h-dvh w-[50%] max-[42.5rem]:hidden" />

      <div className="flex h-dvh w-[50%] items-center justify-center max-[42.5rem]:w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-[90%] flex-col gap-5 p-2"
          >
            <h2 className="flex flex-col items-center justify-center gap-8 text-center text-3xl font-extrabold max-[42.5rem]:text-2xl">
              <Logo className="size-12" />
              Login
            </h2>
            <GoogleLoginButton />
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
              name="password"
              render={({ field }) => (
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
              )}
            />
            <p>
              Not registered yet ?{" "}
              <Link
                to={`/register${callbackUrl ? `?callback=${callbackUrl}` : ""}`}
                className="underline"
              >
                Sign Up
              </Link>
            </p>
            <Button
              variant="default"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-10 w-1/2 self-center rounded-lg"
            >
              Log in
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

export default LoginForm;
