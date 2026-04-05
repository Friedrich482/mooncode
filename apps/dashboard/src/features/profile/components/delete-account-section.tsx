import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { EXTENSION_ID, PUBLISHER } from "@repo/common/constants";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export const DeleteAccountSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  const DeleteAccountFormSchema = z.object({
    email: z.literal(user.email),
    deleteSentence: z.literal("delete my account"),
  });

  const form = useForm<z.infer<typeof DeleteAccountFormSchema>>({
    resolver: zodResolver(DeleteAccountFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const deleteAccountMutation = useMutation(
    trpc.auth.deleteAccount.mutationOptions(),
  );
  const logoutMutation = useMutation(trpc.auth.logOut.mutationOptions());

  const onSubmit = () => {
    deleteAccountMutation.mutate(undefined, {
      onError: (error) => {
        const errorMessage = error.message;
        form.setError("root", { message: errorMessage });
      },

      onSuccess: () => {
        logoutMutation.mutate(undefined, {
          onError: (error) => {
            const errorMessage = error.message;
            form.setError("root", { message: errorMessage });
          },

          onSuccess: async (_, __, ___, { client }) => {
            await client.invalidateQueries({
              queryKey: trpc.auth.getUser.queryKey(),
              exact: true,
            });
            navigate("/login");

            // we need to send a request to the vscode extension to force it to log the deleted user out
            window.location.href = `vscode://${PUBLISHER}.${EXTENSION_ID}/logout`;
          },
        });
      },
    });
  };

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset();
    }
  }, [isDialogOpen]);

  return (
    <section className="border-destructive flex w-full flex-col items-center justify-center rounded-md border max-[25rem]:flex-col">
      <div className="flex w-full flex-col items-start p-4">
        <h2 className="text-destructive text-start text-2xl font-bold max-[18rem]:text-xl">
          Delete Account
        </h2>
        <p>
          This will permanently delete your Personal Account and remove all your
          data from the MoonCode platform. This action is{" "}
          <b className="text-destructive">irreversible</b>, so please continue
          with caution.
        </p>
      </div>

      <div className="bg-destructive/10 w-full border-t p-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Personal Account</Button>
          </DialogTrigger>

          <DialogContent
            className="min-w-72 gap-0 p-0 sm:min-w-120"
            showCloseButton={false}
          >
            <div className="flex max-h-[50dvh] flex-col overflow-x-hidden overflow-y-scroll">
              <DialogHeader className="gap-8 p-4 text-left">
                <DialogTitle className="w-full text-xl font-bold">
                  Delete Personal Account
                </DialogTitle>

                <DialogDescription className="flex flex-col gap-4 text-base">
                  <span>
                    This will permanently delete your Personal Account and
                    remove all your data from the MoonCode platform: all your{" "}
                    <b>projects</b>, <b>languages</b> and <b>files</b> across
                    your projects will be deleted.
                  </span>

                  <span className="bg-destructive/60 inline-block rounded-md p-2">
                    This action is irreversible. Please proceed with caution.
                  </span>
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="bg-background flex flex-1 flex-col gap-5 border-t p-4"
                  id="delete-account-form"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Enter your email <b>{user.email}</b> to continue
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@email.com"
                            type="email"
                            className="border-border h-10"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deleteSentence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          To confirm, type <b>delete my account</b>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-border h-10"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="place-self-center">
                    {form.formState.errors.root && (
                      <FormMessage>
                        {form.formState.errors.root.message}
                      </FormMessage>
                    )}
                  </div>
                </form>
              </Form>
            </div>

            <DialogFooter className="mx-0 my-0 justify-between!">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button
                variant="destructive"
                type="submit"
                form="delete-account-form"
                disabled={form.formState.isSubmitting}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
