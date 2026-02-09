"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronDown, Sparkles, Zap, Crown } from "lucide-react";
import { STRIPE_PLANS, PLAN_FEATURES, PlanType } from "@/lib/stripe";
import { useAuth } from "@/contexts/AuthContext";

const planIcons = {
  start: Zap,
  pro: Sparkles,
  premium: Crown,
};

export function PricingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedPlan, setExpandedPlan] = useState<PlanType | null>(null);
  const plans: PlanType[] = ["start", "pro", "premium"];

  const handleSubscribe = (planKey: PlanType) => {
    if (user) {
      navigate(`/subscribe?plan=${planKey}`);
    } else {
      navigate("/auth");
    }
  };

  return (
    <section id="precos" className="py-16 lg:py-24 relative overflow-visible">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        <ScrollReveal>
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-4">Preços</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Escolha seu plano
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sem período de teste, sem fidelidade. Escolha o plano ideal e comece agora.
            </p>
          </div>
        </ScrollReveal>

        {/* Extra padding top to prevent badge cutting */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto pt-6" staggerDelay={0.1}>
          {plans.map((planKey) => {
            const plan = STRIPE_PLANS[planKey];
            const features = PLAN_FEATURES[planKey];
            const isPopular = plan.popular;
            const isExpanded = expandedPlan === planKey;
            const PlanIcon = planIcons[planKey];

            return (
              <StaggerItem key={planKey} className="overflow-visible">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-card border rounded-2xl overflow-visible h-full flex flex-col ${
                    isPopular 
                      ? "border-primary shadow-xl ring-2 ring-primary/20" 
                      : "border-border/50 shadow-elevated"
                  }`}
                >
                  {/* Popular ribbon */}
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary to-accent rounded-t-2xl" />
                  )}
                  
                  {/* Popular Badge - positioned above card with proper spacing */}
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-lg px-4 py-1 whitespace-nowrap z-10">
                      ⭐ Mais vendido
                    </Badge>
                  )}

                  <div className="p-6 lg:p-8 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        isPopular ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <PlanIcon className={`w-7 h-7 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <span className="text-5xl font-extrabold text-foreground">
                          {plan.price.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-3 mb-6">
                      {features.included.slice(0, 5).map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                      
                      {/* Expandable features */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden space-y-3"
                          >
                            {features.included.slice(5).map((feature) => (
                              <div key={feature} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))}
                            {features.excluded.map((feature) => (
                              <div key={feature} className="flex items-start gap-3 opacity-50">
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                  <X className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* See more button */}
                      {(features.included.length > 5 || features.excluded.length > 0) && (
                        <button
                          onClick={() => setExpandedPlan(isExpanded ? null : planKey)}
                          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
                        >
                          <span>{isExpanded ? "Ver menos" : "Ver todos os recursos"}</span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </button>
                      )}
                    </div>

                    {/* CTA */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`w-full py-6 text-base font-semibold ${
                          isPopular 
                            ? "shadow-lg" 
                            : ""
                        }`}
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => handleSubscribe(planKey)}
                      >
                        Escolher {plan.name}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Trust badges */}
        <ScrollReveal delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Sem fidelidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Pagamento seguro via Stripe</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
