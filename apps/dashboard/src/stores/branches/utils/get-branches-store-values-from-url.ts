import { BranchesSchema } from "../types-schemas";

export const getBranchesStoreValuesFromURL = (): {
  branches: string[] | undefined;
} => {
  // default value
  const defaultBranches = undefined;

  const searchParams = new URLSearchParams(window.location.search);
  const branchesParams = searchParams.getAll("branch");

  const parsedBranches = BranchesSchema.safeParse(branchesParams);

  if (!parsedBranches.success) {
    return { branches: defaultBranches };
  }

  return { branches: parsedBranches.data };
};
