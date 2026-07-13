import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

import { useBranchesStore } from "@/stores/branches/branches-store";

export const NavigationResetWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();

  const resetBranches = useBranchesStore((state) => state.resetBranches);

  useLayoutEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // reset the branches of the branchesStore before going to another page/project
    resetBranches();
  }, [location.pathname]);

  return children;
};
