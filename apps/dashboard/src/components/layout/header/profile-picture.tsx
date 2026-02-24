import React from "react";
import md5 from "js-md5";

import { RouterOutput } from "@/utils/trpc";
import { cn } from "@repo/ui/lib/utils";

type Props = {
  user: RouterOutput["auth"]["getUser"];
  defaultType?: string;
  className?: string;
};

export const ProfilePicture = React.forwardRef<
  HTMLImageElement,
  Props & React.HTMLAttributes<HTMLImageElement>
>(({ user, className, defaultType = "identicon", ...props }, ref) => {
  const url =
    user.authMethod === "email"
      ? `https://www.gravatar.com/avatar/${md5.md5(user.email)}?d=${defaultType}`
      : (user.profilePicture ?? "");

  return (
    <div
      className={cn(
        "hover:bg-accent shrink-0 self-center rounded-full p-1",
        className,
      )}
    >
      <img
        className="size-8 cursor-pointer rounded-full"
        src={url}
        alt={`${user.username ?? "User"}'s avatar`}
        ref={ref}
        {...props}
      />
    </div>
  );
});
