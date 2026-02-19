import { GravatarAvatar } from "@/components/layout/header/gravatar-avatar";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AvatarSection = () => {
  const trpc = useTRPC();
  const {
    data: { email },
  } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  return (
    <section className="flex w-full items-center justify-between rounded-md border p-4 max-[25rem]:flex-col">
      <div className="flex flex-col gap-4 place-self-start">
        <h2 className="text-2xl font-bold max-[18rem]:text-xl">Avatar</h2>
        <p>Here is your profile picture:</p>
      </div>

      <GravatarAvatar
        email={email}
        className="size-24 place-self-end hover:cursor-auto hover:bg-transparent [&_img]:size-22 [&_img]:cursor-auto [&_img]:hover:bg-none"
      />
    </section>
  );
};
