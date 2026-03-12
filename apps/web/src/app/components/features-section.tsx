import { FEATURES } from "../constants";
import { FeatureUnit } from "./feature";

export const FeaturesSection = () => (
  <section
    id="features"
    className="flex w-full flex-col gap-10 px-14 pt-20 pb-4"
  >
    <h2 className="text-center text-4xl font-bold">Key Features</h2>

    <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
      {FEATURES.map((entry) => (
        <FeatureUnit key={entry.title} feature={entry} />
      ))}
    </div>
  </section>
);
