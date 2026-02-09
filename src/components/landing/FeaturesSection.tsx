"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Zap,
  Sparkles,
  Crown,
  Check,
} from "lucide-react";

const planData = [
  {
    id: "start",
    name: "Start",
    icon: Zap,
    color: "primary",
    bgGradient: "from-primary/10 via-primary/5 to-transparent",
    borderColor: "border-primary/30",
    badgeBg: "bg-primary/10 text-primary",
    bullets: [
      "Agenda completa de plantões e consultas",
      "Locais com valores padrão configuráveis",
      "Status de evento e pagamento",
      "Cálculo automático de valores",
      "Dashboard mensal com métricas",
      "Calendário visual integrado",
      "Backup automático na nuvem",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    color: "accent-foreground",
    bgGradient: "from-accent/40 via-accent/20 to-transparent",
    borderColor: "border-accent-foreground/30",
    badgeBg: "bg-accent text-accent-foreground",
    bullets: [
      "Tudo do Start +",
      "Recebimentos inteligentes (7/30 dias)",
      "Gestão de despesas básicas",
      "Relatórios por local e ranking",
      "Metas mensais de faturamento",
      "Exportações CSV e ICS",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    color: "money",
    bgGradient: "from-money/15 via-money/5 to-transparent",
    borderColor: "border-money/30",
    badgeBg: "bg-money/10 text-money",
    bullets: [
      "Tudo do Pro +",
      "Alertas inteligentes de pagamentos",
      "Relatórios de tendências avançados",
      "Despesas categorizadas detalhadas",
      "Resultado líquido real calculado",
      "Exportação pronta para contador",
      "Suporte prioritário dedicado",
    ],
  },
];

interface StackedCardProps {
  plan: typeof planData[0];
  index: number;
  activeIndex: number;
  totalCards: number;
}

function StackedCard({ plan, index, activeIndex, totalCards }: StackedCardProps) {
  const PlanIcon = plan.icon;
  const isActive = index === activeIndex;
  const isPast = index < activeIndex;
  const isFuture = index > activeIndex;

  // Calculate visual states
  const getTransformValues = () => {
    if (isPast) {
      return { y: -40, scale: 0.92, opacity: 0, zIndex: 0 };
    }
    if (isActive) {
      return { y: 0, scale: 1, opacity: 1, zIndex: 30 };
    }
    // Future cards - stacked behind
    const offset = index - activeIndex;
    return { 
      y: offset * 16, 
      scale: 1 - offset * 0.04, 
      opacity: 1 - offset * 0.2,
      zIndex: 20 - offset 
    };
  };

  const { y, scale, opacity, zIndex } = getTransformValues();

  const scrollToSection = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      animate={{ y, scale, opacity }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ zIndex }}
      className={`absolute inset-0 ${isPast ? 'pointer-events-none' : ''}`}
    >
      <div 
        className={`
          h-full w-full rounded-2xl border-2 ${plan.borderColor}
          bg-gradient-to-br ${plan.bgGradient} bg-card
          shadow-xl overflow-visible
          transition-shadow duration-200
          ${isActive ? 'shadow-2xl' : 'shadow-lg'}
        `}
      >
        <div className="p-6 lg:p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${plan.badgeBg} flex items-center justify-center`}>
                <PlanIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground">Plano {plan.name}</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {index === 0 ? "Para começar" : index === 1 ? "Mais popular" : "Completo"}
                </p>
              </div>
            </div>
            <Badge className={`${plan.badgeBg} hidden sm:flex`}>{plan.name}</Badge>
          </div>

          {/* Bullets */}
          <div className="flex-1 space-y-2.5 mb-5 overflow-hidden">
            {plan.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="text-sm text-foreground leading-tight">{bullet}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button 
            onClick={scrollToSection}
            variant={index === 1 ? "default" : "outline"}
            className="w-full py-5 font-semibold"
          >
            Ver detalhes do plano {plan.name}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {planData.map((plan, index) => {
        const isActive = index === activeIndex;
        const PlanIcon = plan.icon;
        
        return (
          <div
            key={plan.id}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
              ${isActive 
                ? `${plan.badgeBg} shadow-md scale-105` 
                : 'bg-muted/60 text-muted-foreground scale-100'
              }
            `}
          >
            <PlanIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{plan.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function MobileCard({ plan }: { plan: typeof planData[0] }) {
  const PlanIcon = plan.icon;

  const scrollToSection = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      className={`
        rounded-2xl border-2 ${plan.borderColor}
        bg-gradient-to-br ${plan.bgGradient} bg-card
        shadow-lg overflow-visible
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${plan.badgeBg} flex items-center justify-center`}>
              <PlanIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          </div>
          <Badge className={plan.badgeBg}>{plan.name}</Badge>
        </div>

        {/* Bullets */}
        <div className="space-y-2 mb-4">
          {plan.bullets.slice(0, 5).map((bullet, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-4 h-4 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className="text-sm text-foreground">{bullet}</span>
            </div>
          ))}
          {plan.bullets.length > 5 && (
            <p className="text-xs text-muted-foreground pl-6">
              +{plan.bullets.length - 5} recursos inclusos
            </p>
          )}
        </div>

        {/* CTA */}
        <Button 
          onClick={scrollToSection}
          variant={plan.id === "pro" ? "default" : "outline"}
          size="sm"
          className="w-full"
        >
          Ver plano {plan.name}
        </Button>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Optimized scroll handler with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const wrapperHeight = wrapper.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Calculate how far we've scrolled through the wrapper
    // When rect.top = viewportHeight, we're at the start (progress = 0)
    // When rect.bottom = 0, we're at the end (progress = 1)
    const scrollableDistance = wrapperHeight - viewportHeight;
    const scrolledAmount = viewportHeight - rect.top;
    const progress = Math.max(0, Math.min(1, scrolledAmount / scrollableDistance));

    // Determine active card based on progress thresholds
    let newIndex = 0;
    if (progress >= 0.66) {
      newIndex = 2; // Premium
    } else if (progress >= 0.33) {
      newIndex = 1; // Pro
    } else {
      newIndex = 0; // Start
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    let rafId: number;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleScroll]);

  // Mobile version - simple stacked cards
  if (isMobile) {
    return (
      <section id="recursos" className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4">
          <ScrollReveal>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-3">Recursos</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Principais recursos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Tudo que você precisa para gerenciar sua carreira médica
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {planData.map((plan) => (
              <ScrollReveal key={plan.id}>
                <MobileCard plan={plan} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop version with scrollytelling
  return (
    <section id="recursos" className="relative bg-gradient-to-b from-background via-muted/10 to-background overflow-visible">
      {/* Scroll wrapper - this creates the scroll distance */}
      <div ref={wrapperRef} className="relative" style={{ minHeight: '240vh' }}>
        
        {/* Sticky container - stays fixed while scrolling through wrapper */}
        <div 
          className="sticky flex flex-col items-center justify-center overflow-visible"
          style={{ 
            top: '80px', 
            height: 'calc(100vh - 80px)',
            paddingTop: '2rem',
            paddingBottom: '2rem',
          }}
        >
          <div className="container px-4 max-w-4xl mx-auto flex flex-col h-full">
            {/* Header */}
            <div className="text-center mb-6 shrink-0">
              <Badge variant="secondary" className="mb-3">Recursos</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Principais recursos
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Planos que crescem com você. Role para explorar cada nível.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-5 shrink-0">
              <ProgressIndicator activeIndex={activeIndex} />
            </div>

            {/* Stacked cards container */}
            <div className="relative flex-1 w-full max-w-2xl mx-auto min-h-[380px]">
              {planData.map((plan, index) => (
                <StackedCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  activeIndex={activeIndex}
                  totalCards={planData.length}
                />
              ))}
            </div>

            {/* Scroll hint */}
            <div className="mt-4 text-center shrink-0">
              <p className="text-xs text-muted-foreground">
                {activeIndex < 2 ? '↓ Role para ver mais planos' : '↓ Continue para ver preços'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
