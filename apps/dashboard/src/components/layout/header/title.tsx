import { Link } from "react-router";

import { Separator } from "@repo/ui/components/ui/separator";
import { SidebarTrigger } from "@repo/ui/components/ui/sidebar";

export const Title = () => (
  <div className="flex items-center justify-center gap-2">
    <SidebarTrigger />
    <Separator
      orientation="vertical"
      className="my-auto data-[orientation=vertical]:h-8"
    />
    <Link
      className="flex shrink-0 items-center justify-center gap-2 text-3xl"
      to="/dashboard"
    >
      <p className="font-bold max-[33rem]:hidden">MoonCode</p>
    </Link>
  </div>
);
