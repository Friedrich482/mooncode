import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./auth-loader";

export const passwordResetCodeVerificationLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  await authRouteLoader();

  const urlPasswordResetEmail = new URL(request.url).searchParams.get("email");

  const parsedUrlPasswordResetEmail = z
    .email()
    .safeParse(urlPasswordResetEmail);

  if (!parsedUrlPasswordResetEmail.success) {
    throw redirect("/login");
  }

  return parsedUrlPasswordResetEmail.data;
};
