import Image from "next/image";

import moon from "@/assets/moon.svg";

export const Title = () => {
  return (
    <p className="flex w-fit items-center justify-center gap-3">
      <Image
        src={moon as unknown as string}
        alt="Logo"
        className="size-10 shrink-0"
      />
      <span className="text-2xl max-[29rem]:hidden">Mooncode</span>
    </p>
  );
};
