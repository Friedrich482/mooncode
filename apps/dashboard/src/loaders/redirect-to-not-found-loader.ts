import { redirect } from "react-router";

export const redirectToNotFoundLoader = () => {
  throw redirect("/not-found");
};
