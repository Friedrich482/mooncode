import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";

import { Logo } from "@/components/layout/header/logo";
import { emailUpdateLoader } from "@/loaders/email-update-loader";
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
import { useMutation } from "@tanstack/react-query";

import {
  UpdateEmailFormSchema,
  UpdateEmailFormSchemaType,
} from "../types-schemas";

export const UpdateEmailForm = () => {
  const emailUpdateToken = useLoaderData<typeof emailUpdateLoader>();

  const form = useForm<UpdateEmailFormSchemaType>({
    resolver: zodResolver(UpdateEmailFormSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    form.setFocus("code");
  }, []);

  const navigate = useNavigate();
  const trpc = useTRPC();
  const updateEmailMutation = useMutation(
    trpc.auth.updateEmail.mutationOptions(),
  );

  const onSubmit = (values: UpdateEmailFormSchemaType) => {
    updateEmailMutation.mutate(
      {
        code: values.code,
        token: emailUpdateToken,
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

        onSuccess: async ({ message }, _, __, { client }) => {
          toast.success(message);

          await client.invalidateQueries({
            queryKey: trpc.auth.getUser.queryKey(),
            exact: true,
          });

          navigate("/profile");
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
          Update email
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
              className="h-10 w-1/2 self-start rounded-lg"
            >
              <Link to="/profile">Back</Link>
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
