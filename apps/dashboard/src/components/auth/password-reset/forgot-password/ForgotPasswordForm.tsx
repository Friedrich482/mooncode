import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Logo from "@/components/layout/header/Logo";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreatePasswordResetDto,
  CreatePasswordResetDtoType,
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
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";

const ForgotPasswordForm = () => {
  const callbackUrl = getCallbackUrl();

  const form = useForm<CreatePasswordResetDtoType>({
    resolver: zodResolver(CreatePasswordResetDto),
    defaultValues: {
      email: "",
    },
  });

  const navigate = useNavigate();
  const trpc = useTRPC();
  const createPasswordResetMutation = useMutation(
    trpc.auth.createPasswordReset.mutationOptions(),
  );

  const onSubmit = async (values: CreatePasswordResetDtoType) => {
    createPasswordResetMutation.mutate(
      {
        email: values.email,
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

        onSuccess: async () => {
          const params = new URLSearchParams();

          params.set("email", values.email);

          if (callbackUrl) {
            params.set("callback", callbackUrl);
          }

          navigate(`/verify-reset-code?${params.toString()}`);
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
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    {...field}
                    className="border-border h-10 w-full"
                  />
                </FormControl>
                <FormDescription>
                  Please enter your email address, we will send you an email
                  with a code to verify your identity
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
                to={`/login${callbackUrl ? `?callback=${callbackUrl}` : ""}`}
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
              Submit
            </Button>
          </div>
        </section>
        <div className="h-4">
          {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
