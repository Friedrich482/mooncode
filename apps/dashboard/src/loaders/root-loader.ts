import { redirect } from "react-router";

export const rootLoader = () => {
  throw redirect("/dashboard");
};
