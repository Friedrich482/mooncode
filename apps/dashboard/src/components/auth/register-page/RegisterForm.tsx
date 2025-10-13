import {
  ALREADY_EXISTING_EMAIL_MESSAGE,
  ALREADY_EXISTING_USERNAME_MESSAGE,
} from "@repo/common/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Link, useNavigate } from "react-router";
import { Button } from "@repo/ui/components/ui/button";
import GoogleLoginButton from "../GoogleLoginButton";
import { Input } from "@repo/ui/components/ui/input";
import LoginMethodSeparator from "../LoginMethodSeparator";
import Logo from "@/components/layout/header/Logo";
import Night from "@/assets/animated-night.svg?react";
import { RegisterUserDto } from "@repo/common/schemas";
import { RegisterUserDtoType } from "@repo/common/types";
import fetchJWTToken from "@repo/common/fetchJWTToken";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import usePageTitle from "@/hooks/usePageTitle";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import { zodResolver } from "@hookform/resolvers/zod";

const RegisterForm = () => {
  usePageTitle("Register | Mooncode");

  useEffect(() => {
    document.getElementById("root")?.classList.add("auth-root");
    return () => {
      document.getElementById("root")?.classList.remove("auth-root");
    };
  }, []);

  const form = useForm<RegisterUserDtoType>({
    resolver: zodResolver(RegisterUserDto),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      callbackUrl: null,
    },
  });

  const { isPasswordVisible, EyeIconComponent } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const callbackUrl = getCallbackUrl();

  const onSubmit = async (values: RegisterUserDtoType) => {
    try {
      const REGISTER_URL = import.meta.env.VITE_REGISTER_URL;

      const token = await fetchJWTToken(REGISTER_URL, {
        email: values.email,
        username: values.username,
        password: values.password,
        callbackUrl,
      });

      if (callbackUrl && token) {
        window.location.href = `${callbackUrl}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(values.email)}`;
      }

      await queryClient.invalidateQueries({
        queryKey: trpc.auth.getUser.queryKey(),
        exact: true,
      });

      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "An error occurred";
      console.error(error);

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage === ALREADY_EXISTING_EMAIL_MESSAGE) {
        form.setError("email", { message: errorMessage });
      } else if (errorMessage === ALREADY_EXISTING_USERNAME_MESSAGE) {
        form.setError("username", { message: errorMessage });
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
