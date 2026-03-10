import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";

const Home = () => (
  <main className="flex flex-1 flex-col gap-40 pt-16">
    <HeroSection />
    <FeaturesSection />
  </main>
);

export default Home;
