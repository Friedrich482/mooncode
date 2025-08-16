import { cn } from "@repo/ui/lib/utils";

const Logo = ({ className }: { className?: string }) => (
  <img
    src="/moon.svg"
    className={cn("size-8", className)}
    alt="MoonCode Logo"
  />
);

export default Logo;
