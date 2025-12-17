import { redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./authLoader";

const passwordResetCodeVerificationLoader = async ({
  request,
}: {
  request: Request;
}) => {
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

export default passwordResetCodeVerificationLoader;
