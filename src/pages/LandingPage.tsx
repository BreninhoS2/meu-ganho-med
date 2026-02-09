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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
}
