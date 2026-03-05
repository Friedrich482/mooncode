import { LoaderFunctionArgs, redirect } from "react-router";
import z from "zod";

import { protectedRouteLoader } from "./auth-loader";

export const emailUpdateLoader = async ({ request }: LoaderFunctionArgs) => {
  await protectedRouteLoader();

  const urlVerificationToken = new URL(request.url).searchParams.get(
    "verification-token",
  );

  const parsedUrlVerificationToken = z.ulid().safeParse(urlVerificationToken);

  if (!parsedUrlVerificationToken.success) {
    throw redirect("/profile");
  }

  return parsedUrlVerificationToken.data;
};
