"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Zap,
  Sparkles,
  Crown,
  Check,
  Calendar,
  Stethoscope,
  BarChart3,
  Bell,
  Target,
  Clock,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  Cloud,
  Shield,
} from "lucide-react";

const planData = [
  {
    id: "start",
    name: "Start",
    icon: Zap,
    color: "primary",
    bgGradient: "from-primary/10 via-primary/5 to-transparent",
    borderColor: "border-primary/40",
    badgeBg: "bg-primary/10 text-primary",
    tagline: "Para começar sua organização",
    bullets: [
      "Agenda completa de plantões e consultas",
      "Locais com valores padrão configuráveis",
      "Status de evento e pagamento",
      "Cálculo automático de valores",
      "Dashboard mensal com métricas",
      "Calendário visual integrado",
      "Backup automático na nuvem",
    ],
    floatingIcons: [Calendar, Stethoscope, Cloud, Shield],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    color: "accent-foreground",
    bgGradient: "from-accent/50 via-accent/20 to-transparent",
    borderColor: "border-accent-foreground/40",
    badgeBg: "bg-accent text-accent-foreground",
    tagline: "O mais escolhido pelos médicos",
    bullets: [
      "Tudo do Start +",
      "Recebimentos inteligentes (7/30 dias)",
      "Gestão de despesas básicas",
      "Relatórios por local e ranking",
      "Metas mensais de faturamento",
      "Exportações CSV e ICS",
    ],
    floatingIcons: [Clock, Receipt, BarChart3, Target],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    color: "money",
    bgGradient: "from-money/20 via-money/10 to-transparent",
    borderColor: "border-money/40",
    badgeBg: "bg-money/10 text-money",
    tagline: "Controle total da sua carreira",
    bullets: [
      "Tudo do Pro +",
      "Alertas inteligentes de pagamentos",
      "Relatórios de tendências avançados",
      "Despesas categorizadas detalhadas",
      "Resultado líquido real calculado",
      "Exportação pronta para contador",
      "Suporte prioritário dedicado",
    ],
    floatingIcons: [Bell, TrendingUp, FileSpreadsheet, Crown],
  },
];

// Floating icon component with animation
function FloatingIcon({ 
  icon: Icon, 
  delay, 
  position,
  color 
}: { 
  icon: typeof Calendar; 
  delay: number; 
  position: { top?: string; bottom?: string; left?: string; right?: string };
  color: string;
}) {
  return (
    <motion.div
      className={`absolute w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${color} flex items-center justify-center shadow-lg backdrop-blur-sm`}
      style={position}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0.7, 1, 0.7],
        y: [0, -8, 0],
        rotate: [0, 5, 0, -5, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, delay },
        y: { duration: 4, repeat: Infinity, delay, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, delay },
        scale: { duration: 0.5, delay: delay * 0.2 },
      }}
    >
      <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
    </motion.div>
  );
}

// Illustration panel for each card
function IllustrationPanel({ plan, isActive }: { plan: typeof planData[0]; isActive: boolean }) {
  const positions = [
    { top: '10%', right: '10%' },
    { top: '25%', left: '5%' },
    { bottom: '20%', right: '15%' },
    { bottom: '10%', left: '10%' },
  ];

  const colorClasses: Record<string, string> = {
    primary: "bg-primary/20 text-primary",
    "accent-foreground": "bg-accent text-accent-foreground",
    money: "bg-money/20 text-money",
  };

  return (
    <div className="relative w-full h-full min-h-[200px] lg:min-h-[300px]">
      {/* Central glow */}
      <motion.div 
        className={`absolute inset-0 rounded-3xl bg-gradient-radial ${plan.bgGradient} opacity-60`}
        animate={{ 
          scale: isActive ? [1, 1.05, 1] : 1,
          opacity: isActive ? [0.4, 0.7, 0.4] : 0.3,
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Main icon in center */}
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 lg:w-28 lg:h-28 rounded-2xl ${colorClasses[plan.color]} flex items-center justify-center shadow-2xl`}
        animate={{ 
          scale: isActive ? [1, 1.08, 1] : 0.9,
          rotate: isActive ? [0, 3, 0, -3, 0] : 0,
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <plan.icon className="w-10 h-10 lg:w-14 lg:h-14" />
      </motion.div>

      {/* Floating icons */}
      <AnimatePresence>
        {isActive && plan.floatingIcons.map((icon, i) => (
          <FloatingIcon 
            key={i}
            icon={icon}
            delay={i * 0.3}
            position={positions[i]}
            color={colorClasses[plan.color]}
          />
        ))}
      </AnimatePresence>

      {/* Decorative circles */}
      <motion.div
        className={`absolute top-1/4 right-1/4 w-32 h-32 rounded-full border-2 ${plan.borderColor} opacity-30`}
        animate={{ scale: [1, 1.1, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full border ${plan.borderColor} opacity-20`}
        animate={{ scale: [1.1, 1, 1.1], rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

interface HeroCardProps {
  plan: typeof planData[0];
  index: number;
  activeIndex: number;
}

function HeroCard({ plan, index, activeIndex }: HeroCardProps) {
  const PlanIcon = plan.icon;
  const isActive = index === activeIndex;
  const isPast = index < activeIndex;
  const isFuture = index > activeIndex;

  const getTransformValues = () => {
    if (isPast) {
      return { y: -80, scale: 0.9, opacity: 0, zIndex: 0 };
    }
    if (isActive) {
      return { y: 0, scale: 1, opacity: 1, zIndex: 30 };
    }
    const offset = index - activeIndex;
    return { 
      y: offset * 24, 
      scale: 1 - offset * 0.05, 
      opacity: 0.6 - offset * 0.2,
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
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ zIndex }}
      className={`absolute inset-0 ${isPast ? 'pointer-events-none' : ''}`}
    >
      <div 
        className={`
          h-full w-full rounded-3xl border-2 ${plan.borderColor}
          bg-gradient-to-br ${plan.bgGradient} bg-card
          shadow-2xl overflow-visible
          ${isActive ? 'ring-2 ring-offset-2 ring-offset-background' : ''}
        `}
        style={{
          boxShadow: isActive 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
            : '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="h-full flex flex-col lg:flex-row p-6 lg:p-10 gap-6 lg:gap-10">
          {/* Content side */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-2xl ${plan.badgeBg} flex items-center justify-center shadow-lg`}>
                <PlanIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Plano {plan.name}</h3>
                  <Badge className={`${plan.badgeBg} text-xs`}>{plan.name}</Badge>
                </div>
                <p className="text-sm lg:text-base text-muted-foreground">{plan.tagline}</p>
              </div>
            </div>

            {/* Bullets */}
            <div className="space-y-3 mb-6 flex-1">
              {plan.bullets.map((bullet, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive ? 1 : 0.6, x: 0 }}
                  transition={{ delay: isActive ? i * 0.04 : 0, duration: 0.2 }}
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
              size="lg"
              className="w-full lg:w-auto lg:px-8 font-semibold shadow-lg"
            >
              Ver detalhes do plano {plan.name}
            </Button>
          </div>

          {/* Illustration side */}
          <div className="flex-1 relative hidden lg:block">
            <IllustrationPanel plan={plan} isActive={isActive} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {planData.map((plan, index) => {
        const isActive = index === activeIndex;
        const PlanIcon = plan.icon;
        
        return (
          <motion.div
            key={plan.id}
            animate={{ 
              scale: isActive ? 1.1 : 1,
              opacity: isActive ? 1 : 0.5,
            }}
            transition={{ duration: 0.2 }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200
              ${isActive ? `${plan.badgeBg} shadow-lg` : 'bg-muted/50 text-muted-foreground'}
            `}
          >
            <PlanIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{plan.name}</span>
            {isActive && (
              <motion.div
                layoutId="activeDot"
                className="w-2 h-2 rounded-full bg-current"
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
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
        shadow-xl overflow-visible
      `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${plan.badgeBg} flex items-center justify-center`}>
              <PlanIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground">{plan.tagline}</p>
            </div>
          </div>
          <Badge className={plan.badgeBg}>{plan.name}</Badge>
        </div>

        {/* Bullets */}
        <div className="space-y-2.5 mb-5">
          {plan.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-4 h-4 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className="text-sm text-foreground">{bullet}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button 
          onClick={scrollToSection}
          variant={plan.id === "pro" ? "default" : "outline"}
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const progressRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);

  // Handle wheel events for pinned scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const headerHeight = 80;

    // Check if section is in view for pinning
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const isInView = sectionTop <= headerHeight + 50 && sectionBottom >= viewportHeight;

    if (!isInView) {
      setIsPinned(false);
      return;
    }

    // We're in the pinned zone
    const delta = e.deltaY;
    const sensitivity = 0.003; // Adjust for scroll sensitivity

    // Calculate new progress
    let newProgress = progressRef.current + (delta * sensitivity);
    newProgress = Math.max(0, Math.min(1, newProgress));

    // Determine if we should allow exit
    const scrollingDown = delta > 0;
    const scrollingUp = delta < 0;
    const atStart = progressRef.current <= 0;
    const atEnd = progressRef.current >= 1;

    // Allow exit only at boundaries
    if (scrollingUp && atStart && activeIndex === 0) {
      setIsPinned(false);
      return; // Let page scroll up
    }
    
    if (scrollingDown && atEnd && activeIndex === 2) {
      setIsPinned(false);
      return; // Let page scroll down
    }

    // Otherwise, prevent default scroll and update progress
    e.preventDefault();
    setIsPinned(true);
    progressRef.current = newProgress;

    // Update active index based on progress thresholds
    let newIndex = 0;
    if (newProgress >= 0.67) {
      newIndex = 2;
    } else if (newProgress >= 0.33) {
      newIndex = 1;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  // Handle touch events for mobile pinned scrolling
  const touchStartY = useRef(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const headerHeight = 80;

    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const isInView = sectionTop <= headerHeight + 50 && sectionBottom >= viewportHeight;

    if (!isInView) {
      setIsPinned(false);
      return;
    }

    const touchY = e.touches[0].clientY;
    const delta = touchStartY.current - touchY;
    touchStartY.current = touchY;

    const sensitivity = 0.008;
    let newProgress = progressRef.current + (delta * sensitivity);
    newProgress = Math.max(0, Math.min(1, newProgress));

    const scrollingDown = delta > 0;
    const scrollingUp = delta < 0;
    const atStart = progressRef.current <= 0;
    const atEnd = progressRef.current >= 1;

    if (scrollingUp && atStart && activeIndex === 0) {
      setIsPinned(false);
      return;
    }
    
    if (scrollingDown && atEnd && activeIndex === 2) {
      setIsPinned(false);
      return;
    }

    e.preventDefault();
    setIsPinned(true);
    progressRef.current = newProgress;

    let newIndex = 0;
    if (newProgress >= 0.67) {
      newIndex = 2;
    } else if (newProgress >= 0.33) {
      newIndex = 1;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  // Setup event listeners
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isMobile) return;

    // Use passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, isMobile]);

  // Touch events for desktop (trackpad)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isMobile) return;

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleTouchStart, handleTouchMove, isMobile]);

  // Sync progress with activeIndex when changed externally
  useEffect(() => {
    if (activeIndex === 0) progressRef.current = 0;
    else if (activeIndex === 1) progressRef.current = 0.5;
    else if (activeIndex === 2) progressRef.current = 1;
  }, []);

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

          <div className="space-y-5">
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

  // Desktop version with true pinned scrollytelling
  return (
    <section 
      id="recursos" 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background via-muted/5 to-background overflow-visible"
      style={{ minHeight: '300vh' }}
    >
      {/* Sticky container */}
      <div 
        className="sticky flex flex-col items-center justify-center overflow-visible"
        style={{ 
          top: '80px', 
          height: 'calc(100vh - 80px)',
        }}
      >
        <div className="container px-4 h-full flex flex-col py-6">
          {/* Header */}
          <div className="text-center mb-4 shrink-0">
            <Badge variant="secondary" className="mb-2">Recursos</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Principais recursos
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Role para explorar os planos. A página fica parada enquanto você navega.
            </p>
          </div>

          {/* Progress dots */}
          <div className="mb-4 shrink-0">
            <ProgressDots activeIndex={activeIndex} />
          </div>

          {/* Cards container - hero size */}
          <div 
            className="relative flex-1 w-full mx-auto overflow-visible"
            style={{ 
              maxWidth: 'min(980px, 92vw)',
              minHeight: 'min(580px, calc(100vh - 280px))',
            }}
          >
            {planData.map((plan, index) => (
              <HeroCard
                key={plan.id}
                plan={plan}
                index={index}
                activeIndex={activeIndex}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <motion.div 
            className="text-center mt-4 shrink-0"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-xs text-muted-foreground">
              {activeIndex === 0 && '↓ Role para ver Pro'}
              {activeIndex === 1 && '↑↓ Role para Start ou Premium'}
              {activeIndex === 2 && '↓ Continue para ver preços'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
