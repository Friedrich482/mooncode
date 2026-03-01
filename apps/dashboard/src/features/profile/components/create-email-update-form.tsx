import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEmailUpdateSchema } from "@repo/common/types-schemas";
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
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { CreateEmailUpdateFormSchemaType } from "../types-schemas";

export const CreateEmailUpdateForm = () => {
  const trpc = useTRPC();
  const {
    data: { email },
  } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  const form = useForm<CreateEmailUpdateFormSchemaType>({
    resolver: zodResolver(CreateEmailUpdateSchema),
    defaultValues: {
      email,
    },
  });

  // update the default value once the user has updated his email and is back on the /profile page
  useEffect(() => {
    form.reset({ email });
  }, [email]);

  const navigate = useNavigate();

  const createEmailUpdateMutation = useMutation(
    trpc.auth.createEmailUpdate.mutationOptions(),
  );

  const onSubmit = async (values: CreateEmailUpdateFormSchemaType) => {
    createEmailUpdateMutation.mutate(
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

        onSuccess: async ({ message, verificationToken }) => {
          toast.success(message);

          const params = new URLSearchParams();

          params.set("verification-token", verificationToken);

          navigate(`/update-email/verify?${params.toString()}`);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col rounded-md border"
      >
        <div className="flex flex-col p-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="text-2xl max-[21rem]:text-xl">
                  Your Email
                </FormLabel>
                <FormDescription>Email</FormDescription>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    {...field}
                    className="border-border h-10 w-1/2 max-sm:w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-start gap-4 border-t p-4">
          <Button
            variant="default"
            type="submit"
            disabled={
              form.formState.isSubmitting || email === form.watch().email
            }
            className="h-10 w-28 rounded-lg"
          >
            Save
          </Button>
          <div className="place-self-center">
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
