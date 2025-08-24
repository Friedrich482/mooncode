import { Button } from "@repo/ui/components/ui/button";
import Google from "@/assets/google.svg?react";
import { Link } from "react-router";

const GoogleLoginButton = () => {
  return (
    <Button variant="ghost" asChild className="rounded-lg border">
      <Link
        to="/auth/google"
        className="flex items-center gap-2"
        aria-label="Continue with Google"
      >
        <Google aria-hidden="true" className="size-4" />
        <span>Continue with Google</span>
      </Link>
    </Button>
  );
};

export default GoogleLoginButton;
