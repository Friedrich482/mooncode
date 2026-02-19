import React from "react";
import md5 from "js-md5";

import { cn } from "@repo/ui/lib/utils";

type GravatarProps = {
  email: string;
  size?: number;
  defaultType?: string;
  className?: string;
};

export const GravatarAvatar = React.forwardRef<
  HTMLImageElement,
  GravatarProps & React.HTMLAttributes<HTMLImageElement>
>(({ email, className, defaultType = "identicon", ...props }, ref) => {
  const hash = md5.md5(email);
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=${defaultType}`;

  return (
    <div
      className={cn(
        "hover:bg-accent shrink-0 self-center rounded-full p-1",
        className,
      )}
    >
      <img
        className="size-8 cursor-pointer rounded-full"
        src={gravatarUrl}
        alt="User Avatar"
        ref={ref}
        {...props}
      />
    </div>
  );
});
