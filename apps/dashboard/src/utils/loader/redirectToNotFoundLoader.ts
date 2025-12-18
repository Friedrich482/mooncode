import { redirect } from "react-router";

const redirectToNotFoundLoader = () => {
  throw redirect("/not-found");
};

export default redirectToNotFoundLoader;
