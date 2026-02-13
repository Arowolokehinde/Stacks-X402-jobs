import { HeroSection } from "@/components/common/HeroSection";
import { FeaturedSkills } from "@/components/common/FeaturedSkills";
import { HowItWorks } from "@/components/common/HowItWorks";
import { PlatformStats } from "@/components/common/PlatformStats";
import { CTABanner } from "@/components/common/CTABanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedSkills />
      <HowItWorks />
      <PlatformStats />
      <CTABanner />
    </>
  );
}
