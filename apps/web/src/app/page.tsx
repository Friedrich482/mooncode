import { Architecture } from "./components/architecture";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";

const Home = () => (
  <main className="flex flex-1 flex-col gap-32 pt-16">
    <HeroSection />
    <FeaturesSection />
    <Architecture />
  </main>
);

export default Home;
