import { redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./authLoader";

const pendingRegistrationLoader = async () => {
  await authRouteLoader();
  const storedPendingRegistrationEmail = localStorage.getItem(
    "pendingRegistrationEmail",
  );

  const parsedStoredPendingRegistrationEmail = z
    .email()
    .safeParse(storedPendingRegistrationEmail);

  if (!parsedStoredPendingRegistrationEmail.success) {
    throw redirect("/register");
  }

  return parsedStoredPendingRegistrationEmail.data;
};

export default pendingRegistrationLoader;
