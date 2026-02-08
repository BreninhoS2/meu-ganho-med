"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { STRIPE_PLANS, PLAN_FEATURES, PlanType } from "@/lib/stripe";

export function PricingSection() {
  const navigate = useNavigate();
  const plans: PlanType[] = ["start", "pro", "premium"];

  return (
    <section id="precos" className="py-20 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:6rem_6rem]" />

      <div className="container relative z-10 px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha seu plano
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sem período de teste, sem fidelidade. Escolha o plano ideal e comece agora.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.1}>
          {plans.map((planKey) => {
            const plan = STRIPE_PLANS[planKey];
            const features = PLAN_FEATURES[planKey];
            const isPopular = plan.popular;

            return (
              <StaggerItem key={planKey}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-card border rounded-2xl p-6 h-full flex flex-col ${
                    isPopular 
                      ? "border-primary shadow-prominent ring-2 ring-primary/20" 
                      : "border-border/50 shadow-elevated"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Mais vendido
                    </Badge>
                  )}

                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-3 mb-6">
                    {features.included.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    {features.excluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className={`w-full ${isPopular ? "" : "variant-outline"}`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => navigate("/subscribe")}
                    >
                      Escolher {plan.name}
                    </Button>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
