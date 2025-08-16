import { Button } from "@repo/ui/components/ui/button";
import { Link } from "react-router";
import usePageTitle from "@/hooks/usePageTitle";

const NotFound = () => {
  usePageTitle("Not found");

  return (
    <main className="flex h-dvh flex-col items-center gap-4 pt-8">
      <img src="/broken_moon.svg" />
      <div className="text-8xl">404</div>
      <p>This Page Could Not Be Found</p>
      <Button asChild className="w-44">
        <Link to="/dashboard">Go Home</Link>
      </Button>
    </main>
  );
};

export default NotFound;
