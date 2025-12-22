import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Logo from "@/components/layout/header/Logo";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  INCORRECT_PASSWORD_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "@repo/common/constants";
import { SignInUserDto, SignInUserDtoType } from "@repo/common/types-schemas";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import GoogleLoginButton from "../GoogleLoginButton";
import LoginMethodSeparator from "../LoginMethodSeparator";

const LoginForm = () => {
  const callbackUrl = getCallbackUrl();

  const form = useForm<SignInUserDtoType>({
    resolver: zodResolver(SignInUserDto),
    defaultValues: {
      email: "",
      password: "",
      callbackUrl,
    },
  });

  const { isPasswordVisible, EyeIconComponent } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const loginMutation = useMutation(trpc.auth.signInUser.mutationOptions());

  const onSubmit = async (values: SignInUserDtoType) => {
    loginMutation.mutate(
      {
        email: values.email,
        password: values.password,
        callbackUrl,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage === INCORRECT_PASSWORD_MESSAGE) {
            form.setError("password", { message: errorMessage });
          } else if (errorMessage === USER_NOT_FOUND_MESSAGE) {
            form.setError("email", { message: errorMessage });
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
            window.location.href = `${callbackUrl}&token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(values.email)}`;
          }
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-[90%] flex-col gap-5 p-2"
      >
        <h2 className="flex flex-col items-center justify-center gap-4 text-center text-3xl font-extrabold max-[42.5rem]:text-2xl">
          <Logo className="size-12" />
          Login
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>
            Not registered yet ?{" "}
            <Link
              to={`/register${callbackUrl ? `?callback=${callbackUrl}` : ""}`}
              className="underline"
            >
              Sign Up
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="underline">
              Lost your password?
            </Link>
          </p>
        </div>
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
  );
};

export default LoginForm;
