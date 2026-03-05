import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./auth-loader";

export const emailVerificationLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  await authRouteLoader();

  const urlVerificationToken = new URL(request.url).searchParams.get(
    "verification-token",
  );

  const parsedUrlVerificationToken = z.ulid().safeParse(urlVerificationToken);

  if (!parsedUrlVerificationToken.success) {
    throw redirect("/register");
  }

  return parsedUrlVerificationToken.data;
};
