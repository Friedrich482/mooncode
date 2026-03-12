import { FEATURES } from "../constants";
import { FeatureUnit } from "./feature-unit";

export const FeaturesSection = () => (
  <section
    id="features"
    className="flex w-full flex-col gap-20 px-14 pt-20 pb-4"
  >
    <div className="flex flex-col gap-8">
      <h2 className="text-center text-5xl font-bold max-sm:text-4xl">
        Key Features
      </h2>
      <p className="text-center font-light">
        Everything we offer to help you seamlessly track your coding activity,
        so you can focus on what matters.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
      {FEATURES.map((entry) => (
        <FeatureUnit key={entry.title} feature={entry} />
      ))}
    </div>
  </section>
);
