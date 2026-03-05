import { Link } from "react-router";

import BrokenMoon from "@/assets/broken_moon.svg?react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@repo/ui/components/ui/button";

export const NotFound = () => {
  usePageTitle("Not Found | MoonCode");

  return (
    <main className="flex h-dvh flex-col items-center gap-4 pt-8">
      <BrokenMoon />
      <div className="text-8xl">404</div>
      <p>This Page Could Not Be Found</p>
      <Button asChild className="w-44">
        <Link to="/dashboard">Go Home</Link>
      </Button>
    </main>
  );
};
