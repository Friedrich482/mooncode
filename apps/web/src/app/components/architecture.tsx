import Zoom from "react-medium-image-zoom";
import Image from "next/image";

import "react-medium-image-zoom/dist/styles.css";

export const Architecture = () => (
  <section
    id="architecture"
    className="flex w-full flex-col gap-10 px-14 pt-20 pb-12"
  >
    <h2 className="text-center text-4xl font-bold">Architecture</h2>

    <Zoom wrapElement="span" canSwipeToUnzoom={true}>
      <Image
        src="/mooncode-architecture.svg"
        alt="Architecture Diagram"
        width={600}
        height={100}
        loading="lazy"
        className="w-4/5 cursor-zoom-in place-self-center rounded-xl max-md:w-full"
      />
    </Zoom>
  </section>
);
