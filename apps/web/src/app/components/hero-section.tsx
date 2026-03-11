import Image from "next/image";
import Link from "next/link";

import animatedNight from "@/assets/animated-night.svg";
import vscode from "@/assets/vscode.svg";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@repo/ui/components/ui/button";

export const HeroSection = () => (
  <section className="relative flex flex-col items-center justify-center gap-12 pt-20 pb-60">
    <Image
      src={animatedNight as unknown as string}
      alt="Animated night background image"
      className="-z-30 object-cover object-top-right opacity-80"
      fill
    />

    <h1 className="w-1/2 text-center text-7xl font-bold max-md:w-3/4 max-sm:text-5xl">
      Track your{" "}
      <span className="text-primary-foreground relative inline-block">
        coding
        <span className="bg-primary/90 absolute left-0 -z-10 inline-block h-[110%] w-[105%] -skew-x-12" />
      </span>{" "}
      time with ease
    </h1>

    <p className="w-1/2 text-center font-light max-md:w-3/4">
      Monitor your coding activity with a detailed summary of your projects,
      languages used and files, all in one place
    </p>

    <div className="flex w-full items-center justify-center gap-5 max-md:flex-col">
      <Button
        asChild
        className="w-52 gap-3 rounded-2xl p-6 text-base font-bold max-md:w-[max(50%,12rem)]"
        size="lg"
      >
        <Link
          href="https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode&ssr=false#review-details"
          target="_blank"
        >
          <Image
            src={vscode as unknown as string}
            alt="VSCode Icon"
            className="size-6 shrink-0"
          />
          VSCode Extension
        </Link>
      </Button>

      <Button
        asChild
        className="w-52 gap-3 rounded-2xl p-6 text-base font-bold max-md:w-[max(50%,12rem)]"
        size="lg"
        variant="outline"
      >
        <Link href="https://github.com/Friedrich482/mooncode" target="_blank">
          <SiGithub />
          GitHub
        </Link>
      </Button>
    </div>
  </section>
);
