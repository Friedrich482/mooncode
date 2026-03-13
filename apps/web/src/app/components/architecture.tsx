import Zoom from "react-medium-image-zoom";
import Image from "next/image";

import mooncodeArchitecture from "@/assets/mooncode-architecture.svg";

import { BLUR_DATA_URL } from "../constants";
import { FadeContent } from "./motion/fade-content";

import "react-medium-image-zoom/dist/styles.css";

export const Architecture = () => (
  <section
    id="architecture"
    className="flex w-full flex-col gap-20 px-14 pt-20 pb-12"
  >
    <FadeContent className="flex flex-col gap-8">
      <h2 className="text-center text-5xl font-bold wrap-anywhere max-sm:text-4xl">
        Project Architecture
      </h2>
      <p className="text-center font-light">
        We currently operate through a local dashboard and a NestJS API. It is
        simple but it gets the job done.
      </p>
    </FadeContent>

    <Zoom wrapElement="span" canSwipeToUnzoom={true}>
      <Image
        src={mooncodeArchitecture as unknown as string}
        alt="Architecture Diagram"
        width={600}
        height={100}
        loading="lazy"
        className="w-4/5 cursor-zoom-in place-self-center rounded-xl max-md:w-full"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
    </Zoom>
  </section>
);
