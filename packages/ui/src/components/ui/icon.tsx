import React, { ButtonHTMLAttributes } from "react";
import { LucideProps } from "lucide-react";

import { Button } from "./button";

import { cn } from "#lib/utils.ts";

export const Icon = ({
  className,
  Icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}) => (
  <Button
    variant="ghost"
    size="icon"
    {...props}
    className={cn("size-10 [&_svg:not([class*='size-'])]:size-3/5", className)}
  >
    <Icon />
  </Button>
);
