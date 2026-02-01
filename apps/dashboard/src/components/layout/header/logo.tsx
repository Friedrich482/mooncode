import Moon from "@/assets/moon.svg?react";
import { cn } from "@repo/ui/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Moon className={cn("size-8", className)} />
);
