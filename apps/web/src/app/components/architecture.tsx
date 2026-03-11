import Image from "next/image";

export const Architecture = () => {
  return (
    <section
      id="architecture"
      className="flex w-full flex-col gap-10 px-14 pt-20 pb-12"
    >
      <h2 className="text-center text-4xl font-bold">Architecture</h2>

      <div className="visible w-4/5 place-self-center max-md:w-full">
        <Image
          src="/mooncode-architecture.svg"
          alt="Architecture Diagram"
          width={500}
          height={500}
          loading="lazy"
          className="w-full cursor-zoom-in"
        />
      </div>
    </section>
  );
};
