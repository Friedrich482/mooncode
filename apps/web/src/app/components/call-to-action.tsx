import Image from "next/image";
import Link from "next/link";

import vscode from "@/assets/vscode.svg";
import { Button } from "@repo/ui/components/ui/button";

import { FadeContent } from "./motion/fade-content";

export const CallToAction = () => (
  <section
    id="installation"
    className="flex w-full flex-col gap-20 border-t px-14 pt-20 pb-12"
  >
    <FadeContent className="flex flex-col gap-8">
      <h2 className="text-center text-5xl font-bold max-sm:text-4xl">
        Ready to jump in?
      </h2>

      <p className="text-center font-light">
        Get started by installing the VSCode extension. It is entirely{" "}
        <span className="text-primary">free</span> and{" "}
        <span className="text-primary">open source</span>.
      </p>
    </FadeContent>

    <Button
      asChild
      className="w-52 gap-3 place-self-center rounded-md p-6 text-base font-bold max-md:w-[max(50%,12rem)]"
    >
      <Link
        href="https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode&ssr=false#review-details"
        target="_blank"
        className="transition duration-200 hover:-translate-y-1"
      >
        <Image
          src={vscode as unknown as string}
          alt="VSCode Icon"
          className="size-6 shrink-0"
        />
        VSCode Extension
      </Link>
    </Button>
  </section>
);
