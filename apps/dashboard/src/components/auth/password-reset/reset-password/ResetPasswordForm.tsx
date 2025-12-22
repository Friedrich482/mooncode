import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router";

import Logo from "@/components/layout/header/Logo";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import {
  ResetPasswordFormSchema,
  ResetPasswordFormSchemaType,
} from "@/types-schemas";
import getCallbackUrl from "@/utils/getCallbackUrl";
import passwordResetLoader from "@/utils/loader/passwordResetLoader";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordDtoType } from "@repo/common/types-schemas";
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
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CodeVerificationForm = () => {
  const callbackUrl = getCallbackUrl();

  const { passwordResetEmail, passwordResetToken } =
    useLoaderData<typeof passwordResetLoader>();

  const backLinkParams = new URLSearchParams();
  backLinkParams.set("email", passwordResetEmail);

  if (callbackUrl) {
    backLinkParams.set("callback", callbackUrl);
  }

  const form = useForm<ResetPasswordFormSchemaType>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      email: passwordResetEmail,
      token: passwordResetToken,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isPasswordVisible, EyeIconComponent: PasswordEyeIconComponent } =
    useTogglePassword();
  const {
    isPasswordVisible: isConfirmPasswordVisible,
    EyeIconComponent: ConfirmPasswordEyeIconComponent,
  } = useTogglePassword();

  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const resetPasswordMutation = useMutation(
    trpc.auth.resetPassword.mutationOptions(),
  );

  const onSubmit = async (values: ResetPasswordDtoType) => {
    resetPasswordMutation.mutate(
      {
        email: passwordResetEmail,
        token: passwordResetToken,
        newPassword: values.newPassword,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("code")) {
            form.setError("token", { message: errorMessage });
          } else if (errorMessage.toLowerCase().includes("password")) {
            form.setError("newPassword", { message: errorMessage });
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
            window.location.href = `${callbackUrl}&token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(passwordResetEmail)}`;
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
          Forgotten Password
        </h2>
        <section className="flex w-full flex-1 flex-col items-start gap-8 pt-8">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="w-full">
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
                  <PasswordEyeIconComponent />
                </div>
                <FormDescription>Enter your new password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative flex items-center justify-end gap-2">
                  <FormControl>
                    <Input
                      placeholder="**********"
                      {...field}
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      className="border-border h-10 flex-nowrap"
                    />
                  </FormControl>
                  <ConfirmPasswordEyeIconComponent />
                </div>
                <FormDescription>Confirm the new password</FormDescription>
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
              <Link to={`/verify-reset-code?${backLinkParams.toString()}`}>
                Back
              </Link>
            </Button>
            <Button
              variant="default"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-10 w-1/2 self-start rounded-lg"
            >
              Submit
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

export default CodeVerificationForm;
