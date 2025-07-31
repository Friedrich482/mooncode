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
import { Input } from "@repo/ui/components/ui/input";
import { RegisterUserDto } from "@repo/common/schemas";
import { RegisterUserDtoType } from "@repo/common/types";
import fetchJWTToken from "@repo/common/fetchJWTToken";
import getCallbackUrl from "@/utils/getCallbackUrl";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import useTogglePassword from "@/hooks/auth/useTogglePassword";
import { zodResolver } from "@hookform/resolvers/zod";

const RegisterForm = () => {
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
    <main className="flex flex-col items-center justify-center pb-8 pt-16 text-black dark:text-white">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-[clamp(15rem,60%,25rem)] flex-col gap-8"
        >
          <h2 className="text-center text-3xl font-extrabold text-black dark:text-white max-sm:text-2xl">
            Register to MoonCode
          </h2>
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
                    className="h-10 border-border"
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
                    className="h-10 border-border"
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
                        className="h-10 flex-nowrap border-border"
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
            Already registered ?{" "}
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
    </main>
  );
};

export default RegisterForm;
