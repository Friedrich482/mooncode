import { Architecture } from "./components/architecture";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { TabsSection } from "./components/tabs-section";

const Home = () => (
  <main className="flex flex-1 flex-col gap-36 pt-16">
    <HeroSection />
    <FeaturesSection />
    <Architecture />
    <TabsSection />
  </main>
);

export default Home;
