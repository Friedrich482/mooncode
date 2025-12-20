import { redirect } from "react-router";

const rootLoader = () => {
  throw redirect("/dashboard");
};

export default rootLoader;
