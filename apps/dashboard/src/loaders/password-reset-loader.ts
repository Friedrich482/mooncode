import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./auth-loader";

export const passwordResetLoader = async ({ request }: LoaderFunctionArgs) => {
  await authRouteLoader();

  const urlPasswordResetToken = new URL(request.url).searchParams.get(
    "password-reset-token",
  );

  const parsedUrlPasswordResetToken = z.ulid().safeParse(urlPasswordResetToken);

  if (!parsedUrlPasswordResetToken.success) {
    throw redirect("/login");
  }

  return parsedUrlPasswordResetToken.data;
};
