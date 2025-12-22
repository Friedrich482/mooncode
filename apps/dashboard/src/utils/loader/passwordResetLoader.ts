import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./authLoader";

const passwordResetLoader = async ({ request }: LoaderFunctionArgs) => {
  await authRouteLoader();

  const urlPasswordResetEmail = new URL(request.url).searchParams.get("email");
  const urlPasswordResetToken = new URL(request.url).searchParams.get("token");

  const parsedUrlSearchParams = z
    .object({
      passwordResetEmail: z.email(),
      passwordResetToken: z.ulid(),
    })
    .safeParse({
      passwordResetEmail: urlPasswordResetEmail,
      passwordResetToken: urlPasswordResetToken,
    });

  if (!parsedUrlSearchParams.success) {
    throw redirect("/login");
  }

  return parsedUrlSearchParams.data;
};

export default passwordResetLoader;
