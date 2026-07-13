import { create } from "zustand";

import { getBranchesStoreValuesFromURL } from "./utils/get-branches-store-values-from-url";

type BranchesStore = {
  branches: string[] | undefined;
  resetBranches: () => void;
  handleCheckBranch: (branch: string) => void;
};

const { branches: initialBranches } = getBranchesStoreValuesFromURL();

export const useBranchesStore = create<BranchesStore>((set, get) => ({
  branches: initialBranches,
  resetBranches: () => {
    set({ branches: undefined });
  },
  handleCheckBranch: (branch) => {
    const branches = get().branches;

    if (!branches) {
      set({ branches: [branch] });
      updateURLFromState(get().branches);

      return;
    }

    const isBranchInState = branches.some((entry) => entry === branch);

    if (!isBranchInState) {
      set({ branches: [...branches, branch] });
      updateURLFromState(get().branches);

      return;
    }

    if (branches.length === 1) {
      set({ branches: undefined });
      updateURLFromState(get().branches);

      return;
    }

    set({ branches: branches.filter((entry) => entry !== branch) });
    updateURLFromState(get().branches);

    return;
  },
}));

const updateURLFromState = (branches: BranchesStore["branches"]) => {
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.delete("branch");

  branches?.forEach((branch) => {
    searchParams.append("branch", branch);
  });

  window.history.replaceState(null, "", `?${searchParams.toString()}`);
};
