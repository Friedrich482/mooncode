import { LoaderFunctionArgs, redirect } from "react-router";

import { ProjectParamsSchema } from "@/types-schemas";

import { trpcLoaderClient } from "../trpc";
import { protectedRouteLoader } from "./authLoader";

const projectLoader = async ({ params }: LoaderFunctionArgs) => {
  await protectedRouteLoader();

  const result = ProjectParamsSchema.safeParse(params);
  if (!result.success) {
    throw redirect("/not-found");
  }

  const projectExists =
    await trpcLoaderClient.analytics.projects.checkProjectExists.query({
      name: result.data.projectName,
    });

  if (!projectExists) {
    throw redirect("/not-found");
  }

  return result.data;
};

export default projectLoader;
