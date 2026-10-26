// src/pages/public/LandingPage.tsx


import { PublicFooter } from "../../components/layouts/PublicFooter";
import { PublicHeader } from "../../components/layouts/PublicHeader";
import { BenefitsSection } from "../../components/sections/landing/BenefitsSection";
import { CTASection } from "../../components/sections/landing/CTASection";
import { EarningsSimulatorSection } from "../../components/sections/landing/EarningsSimulatorSection";
import { FAQSection } from "../../components/sections/landing/FAQSection";
import { HeroSection } from "../../components/sections/landing/HeroSection";
import { HowItWorksSection } from "../../components/sections/landing/HowItWorksSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <EarningsSimulatorSection />
        <FAQSection />
        <CTASection />
      </main>

      <PublicFooter />
    </div>
  );
}