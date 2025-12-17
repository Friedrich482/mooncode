import { redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./authLoader";

const pendingRegistrationLoader = async ({ request }: { request: Request }) => {
  await authRouteLoader();

  const urlPendingRegistrationEmail = new URL(request.url).searchParams.get(
    "email",
  );

  const parsedUrlPendingRegistrationEmail = z
    .email()
    .safeParse(urlPendingRegistrationEmail);

  if (!parsedUrlPendingRegistrationEmail.success) {
    throw redirect("/register");
  }

  return parsedUrlPendingRegistrationEmail.data;
};

export default pendingRegistrationLoader;
