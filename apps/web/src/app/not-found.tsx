import Image from "next/image";
import Link from "next/link";

import brokenMoon from "@/assets/broken-moon.svg";
import { Button } from "@repo/ui/components/ui/button";

const NotFound = () => (
  <main className="flex flex-1 flex-col items-center justify-center gap-8 py-28">
    <Image src={brokenMoon as unknown as string} alt="Not found page image " />

    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-8xl">404</h1>

      <p>This Page Could Not Be Found</p>

      <Button asChild className="w-44">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  </main>
);

export default NotFound;
