import { Architecture } from "./components/architecture";
import { CallToAction } from "./components/call-to-action";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { TabsSection } from "./components/tabs-section";

const Home = () => (
  <main className="flex flex-1 flex-col gap-36 pt-16">
    <HeroSection />
    <FeaturesSection />
    <TabsSection />
    <Architecture />
    <CallToAction />
  </main>
);

export default Home;
