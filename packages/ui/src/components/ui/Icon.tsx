import { Button } from "./button";
import { LucideProps } from "lucide-react";
import React, { ButtonHTMLAttributes } from "react";
import { cn } from "#lib/utils.ts";

const Icon = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    Icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
  }
>(({ className, Icon, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    {...props}
    className={cn("size-10 [&_svg]:size-auto", className)}
  >
    <Icon />
  </Button>
));
Icon.displayName = "Icon";

export default Icon;
