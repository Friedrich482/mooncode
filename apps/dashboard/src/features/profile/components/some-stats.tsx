import { CodingTimeSinceRegistration } from "./coding-time-since-registration";
import { ContributionsGraph } from "./contributions-graph";
import { LanguagesUsedSinceRegistration } from "./languages-used-since-registration";

export const SomeStats = () => {
  return (
    <section className="rounded-md border">
      <div className="flex p-4">
        <h2 className="w-full text-start text-2xl font-bold max-[21rem]:text-xl">
          Some Stats
        </h2>
      </div>

      <div className="flex flex-col gap-4 border-t py-2">
        <ContributionsGraph />
        <CodingTimeSinceRegistration />
        <LanguagesUsedSinceRegistration />
      </div>
    </section>
  );
};
