"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Calculator, 
  LayoutDashboard, 
  CalendarDays,
  Cloud,
  Clock,
  Receipt,
  BarChart3,
  Target,
  FileDown,
  Bell,
  TrendingUp,
  Tags,
  FileSpreadsheet,
  Headphones,
  Zap,
  Sparkles,
  Crown,
  ArrowDown,
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

  // Calculate transform values
  const yOffset = isPast ? -100 : isFuture ? (index - activeIndex) * 20 : 0;
  const scale = isPast ? 0.95 : isFuture ? 1 - (index - activeIndex) * 0.03 : 1;
  const opacity = isPast ? 0 : isFuture ? 1 - (index - activeIndex) * 0.15 : 1;
  const zIndex = totalCards - Math.abs(index - activeIndex);

  const scrollToSection = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      animate={{
        y: yOffset,
        scale,
        opacity,
      }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ zIndex }}
      className={`absolute inset-0 ${isPast ? 'pointer-events-none' : ''}`}
    >
      <div 
        className={`
          h-full w-full rounded-2xl border-2 ${plan.borderColor}
          bg-gradient-to-br ${plan.bgGradient} bg-card
          shadow-xl backdrop-blur-sm overflow-hidden
          transition-shadow duration-300
          ${isActive ? 'shadow-2xl' : 'shadow-lg'}
        `}
      >
        <div className="p-6 lg:p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${plan.badgeBg} flex items-center justify-center`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Plano {plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {index === 0 ? "Para começar" : index === 1 ? "Mais popular" : "Completo"}
                </p>
              </div>
            </div>
            <Badge className={plan.badgeBg}>{plan.name}</Badge>
          </div>

          {/* Bullets */}
          <div className="flex-1 space-y-3 mb-6">
            {plan.bullets.map((bullet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isActive ? 1 : 0.7, x: 0 }}
                transition={{ delay: isActive ? i * 0.05 : 0, duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className={`w-5 h-5 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm lg:text-base text-foreground">{bullet}</span>
              </motion.div>
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
        shadow-lg overflow-hidden
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Map progress to card index (0 to 2)
    const newIndex = Math.min(2, Math.floor(progress * 3));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  // Mobile version
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

  // Desktop version with scroll animation
  return (
    <section id="recursos" className="relative bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Scroll container */}
      <div ref={containerRef} className="h-[250vh]">
        {/* Sticky content */}
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden py-16">
          <div className="container px-4 max-w-4xl mx-auto">
            {/* Header */}
            <ScrollReveal>
              <div className="text-center mb-10">
                <Badge variant="secondary" className="mb-4">Recursos</Badge>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Principais recursos
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Planos que crescem com você. Role para explorar cada nível.
                </p>
              </div>
            </ScrollReveal>

            {/* Stacked cards container */}
            <div className="relative h-[420px] w-full max-w-3xl mx-auto">
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

            {/* Progress indicators */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {planData.map((plan, index) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    // Scroll to approximate position
                    if (containerRef.current) {
                      const scrollAmount = (index / 2) * containerRef.current.scrollHeight;
                      window.scrollTo({
                        top: containerRef.current.offsetTop + scrollAmount,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                    ${index === activeIndex 
                      ? `${plan.badgeBg} shadow-md` 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  <plan.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{plan.name}</span>
                </button>
              ))}
            </div>

            {/* Scroll hint */}
            <motion.div 
              className="flex flex-col items-center mt-6 text-muted-foreground"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs mb-1">Role para explorar</span>
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
