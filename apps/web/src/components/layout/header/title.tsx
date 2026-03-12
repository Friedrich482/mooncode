import Image from "next/image";
import Link from "next/link";

import moon from "@/assets/moon.svg";

export const Title = () => {
  return (
    <Link href="/" className="flex w-fit items-center justify-center gap-3">
      <Image
        src={moon as unknown as string}
        alt="Logo"
        className="size-10 shrink-0"
      />
      <span className="text-2xl max-[29rem]:hidden">MoonCode</span>
    </Link>
  );
};
