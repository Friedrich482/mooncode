import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./auth-loader";

export const emailVerificationLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  await authRouteLoader();

  const urlEmailVerificationEmail = new URL(request.url).searchParams.get(
    "email",
  );

  const parsedUrlEmailVerificationEmail = z
    .email()
    .safeParse(urlEmailVerificationEmail);

  if (!parsedUrlEmailVerificationEmail.success) {
    throw redirect("/register");
  }

  return parsedUrlEmailVerificationEmail.data;
};
