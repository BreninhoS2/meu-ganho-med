"use client";

import {
  LandingNavbar,
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  PricingSection,
  FAQSection,
  FooterSection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
}
