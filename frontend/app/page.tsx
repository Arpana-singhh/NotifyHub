import HomeNavbar from './components/home/HomeNavbar';
import HeroSection from './components/home/HeroSection';
import FeaturesSection from './components/home/FeaturesSection';
import StatsSection from './components/home/StatsSection';
import HowItWorksSection from './components/home/HowItWorksSection';
import CtaSection from './components/home/CtaSection';
import HomeFooter from './components/home/HomeFooter';
import CursorFollower from './components/home/CursorFollower';

export default function LandingPage() {
  return (
    <main className="home">
      <CursorFollower />
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <CtaSection />
      <HomeFooter />
    </main>
  );
}
