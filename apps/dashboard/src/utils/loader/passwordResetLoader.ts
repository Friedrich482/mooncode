import { redirect } from "react-router";
import z from "zod";

import { authRouteLoader } from "./authLoader";

const passwordResetLoader = async () => {
  await authRouteLoader();

  const storedPasswordResetEmail = localStorage.getItem("passwordResetEmail");

  const parsedStoredPasswordResetEmail = z
    .email()
    .safeParse(storedPasswordResetEmail);

  if (!parsedStoredPasswordResetEmail.success) {
    throw redirect("/login");
  }

  return parsedStoredPasswordResetEmail.data;
};

export default passwordResetLoader;
