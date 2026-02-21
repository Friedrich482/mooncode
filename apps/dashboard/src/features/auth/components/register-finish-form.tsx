import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router";

import { Logo } from "@/components/layout/header/logo";
import { emailVerificationLoader } from "@/loaders/email-verification-loader";
import { getCallbackUrl } from "@/utils/get-callback-url";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
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

import { useTogglePassword } from "../hooks/use-toggle-password";
import { RegisterFormSchema, RegisterFormSchemaType } from "../types-schemas";

export const RegisterFinishForm = () => {
  const callbackUrl = getCallbackUrl();

  const verificationToken = useLoaderData<typeof emailVerificationLoader>();

  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { isPasswordVisible, EyeIconComponent } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const registerMutation = useMutation(trpc.auth.register.mutationOptions());

  const onSubmit = (values: RegisterFormSchemaType) => {
    registerMutation.mutate(
      {
        username: values.username,
        password: values.password,
        token: verificationToken,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("username")) {
            form.setError("username", { message: errorMessage });
          } else if (errorMessage.toLowerCase().includes("password")) {
            form.setError("password", { message: errorMessage });
          } else {
            form.setError("root", { message: errorMessage });
          }
        },

        onSuccess: async ({ accessToken, email }, _, __, { client }) => {
          await client.invalidateQueries({
            queryKey: trpc.auth.getUser.queryKey(),
            exact: true,
          });

          navigate("/dashboard");

          if (callbackUrl && accessToken) {
            window.location.href = `${callbackUrl}&token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(email)}`;
          }
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
  );
};
