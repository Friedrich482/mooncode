import { Link, useNavigate } from "react-router";
import { LayoutDashboard, LogOut, User, User2 } from "lucide-react";

import { LinkWithQuery } from "@/components/common/link-with-query";
import { useTRPC } from "@/utils/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Icon } from "@repo/ui/components/ui/icon";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";

import { GravatarAvatar } from "./gravatar-avatar";

export const AuthDropDown = () => {
  const trpc = useTRPC();
  const navigate = useNavigate();

  const mutation = useMutation(trpc.auth.logOut.mutationOptions());

  const { data, error, isLoading } = useQuery(trpc.auth.getUser.queryOptions());

  if (isLoading) {
    return <Skeleton className="size-10 self-center rounded-full" />;
  }

  if (!data || error) {
    return (
      <Link to="/login">
        <Icon Icon={User} />
      </Link>
    );
  }

  const { email, username } = data;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GravatarAvatar email={email} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-48 -translate-x-2 flex-col gap-1 p-2">
        <div className="flex flex-col px-2 py-1">
          <p>{username}</p>
          <p className="text-sm opacity-50">{email}</p>
        </div>
        <DropdownMenuSeparator className="w-full" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md py-1 text-base"
        >
          <LinkWithQuery to="/dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </LinkWithQuery>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md py-1 text-base"
        >
          <LinkWithQuery to="/profile">
            <User2 />
            <span>Profile</span>
          </LinkWithQuery>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="w-full" />

        <DropdownMenuItem
          className="cursor-pointer rounded-md py-1 text-base"
          onClick={() => {
            mutation.mutate(undefined, {
              onSuccess: async (_, __, ___, { client }) => {
                await client.invalidateQueries({
                  queryKey: trpc.auth.getUser.queryKey(),
                  exact: true,
                });
                navigate("/login");
              },
            });
          }}
        >
          <LogOut />
          Log Out{" "}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
