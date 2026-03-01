import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUsernameSchema } from "@repo/common/types-schemas";
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

import { UpdateUsernameFormSchemaType } from "../types-schemas";

export const UpdateUsernameForm = () => {
  const trpc = useTRPC();
  const {
    data: { username },
  } = useSuspenseQuery(trpc.auth.getUser.queryOptions());
  const updateUsernameMutation = useMutation(
    trpc.auth.updateUsername.mutationOptions(),
  );

  const form = useForm<UpdateUsernameFormSchemaType>({
    resolver: zodResolver(UpdateUsernameSchema),
    defaultValues: {
      username,
    },
  });

  const onSubmit = async (values: UpdateUsernameFormSchemaType) => {
    updateUsernameMutation.mutate(
      {
        username: values.username,
      },
      {
        onError: (error) => {
          const errorMessage = error.message;

          if (errorMessage.toLowerCase().includes("username")) {
            form.setError("username", { message: errorMessage });
          } else {
            form.setError("root", { message: errorMessage });
          }
        },

        onSuccess: async ({ username }, _, __, { client }) => {
          await client.invalidateQueries({
            queryKey: trpc.auth.getUser.queryKey(),
            exact: true,
          });

          form.setValue("username", username);

          toast.success("Username updated");
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
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="text-2xl max-[21rem]:text-xl">
                  Your Username
                </FormLabel>
                <FormDescription>Username</FormDescription>
                <FormControl>
                  <Input
                    placeholder="example"
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
              form.formState.isSubmitting || username === form.watch().username
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
