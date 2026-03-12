import { Tabs } from "./tabs";

export const TabsSection = () => (
  <section className="flex w-full flex-col gap-10 px-14 pt-20 pb-12">
    <div className="flex flex-col gap-2">
      <h2 className="text-center text-4xl font-bold">
        Comprehensive overview of your coding activity
      </h2>
      <p className="text-center font-light">
        Simplify the way you review and understand your coding habits across
        projects and time periods
      </p>
    </div>

    <Tabs />
  </section>
);
