import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";

const Home = () => (
  <main className="flex flex-1 flex-col gap-40">
    <HeroSection />
    <FeaturesSection />
  </main>
);

export default Home;
