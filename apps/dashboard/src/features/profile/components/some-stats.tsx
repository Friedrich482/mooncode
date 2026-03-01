import { ContributionsGraph } from "./contributions-graph";

export const SomeStats = () => {
  return (
    <section className="rounded-md border">
      <div className="flex p-4">
        <h2 className="w-full text-start text-2xl font-bold max-[21rem]:text-xl">
          Some Stats
        </h2>
      </div>

      <ContributionsGraph />
    </section>
  );
};
