"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
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

const TRANSITION_DURATION = 0.5;

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

const colorClasses: Record<string, string> = {
  primary: "bg-primary/20 text-primary",
  "accent-foreground": "bg-accent text-accent-foreground",
  money: "bg-money/20 text-money",
};

// Floating icon component - GPU accelerated
const FloatingIcon = memo(function FloatingIcon({
  icon: Icon,
  delay,
  position,
  color,
}: {
  icon: typeof Calendar;
  delay: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  color: string;
}) {
  return (
    <motion.div
      className={`absolute w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${color} flex items-center justify-center shadow-lg`}
      style={{ ...position, willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.7, 1, 0.7],
        y: [0, -8, 0],
        rotate: [0, 5, 0, -5, 0],
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, delay },
        y: { duration: 4, repeat: Infinity, delay, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, delay },
        scale: { duration: 0.5, delay: delay * 0.15 },
      }}
    >
      <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
    </motion.div>
  );
});

const iconPositions = [
  { top: '8%', right: '8%' },
  { top: '20%', left: '4%' },
  { bottom: '15%', right: '12%' },
  { bottom: '8%', left: '8%' },
];

// Illustration panel - memoized
const IllustrationPanel = memo(function IllustrationPanel({
  plan,
  isActive,
}: {
  plan: typeof planData[0];
  isActive: boolean;
}) {
  return (
    <div className="relative w-full h-full min-h-[160px] lg:min-h-[200px]">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-radial ${plan.bgGradient} opacity-40`} />

      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 lg:w-20 lg:h-20 rounded-xl ${colorClasses[plan.color]} flex items-center justify-center shadow-xl`}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 0.9,
          rotate: isActive ? [0, 2, 0, -2, 0] : 0,
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <plan.icon className="w-8 h-8 lg:w-10 lg:h-10" />
      </motion.div>

      <AnimatePresence mode="wait">
        {isActive &&
          plan.floatingIcons.map((icon, i) => (
            <FloatingIcon
              key={`${plan.id}-${i}`}
              icon={icon}
              delay={i * 0.2}
              position={iconPositions[i]}
              color={colorClasses[plan.color]}
            />
          ))}
      </AnimatePresence>

      <div className={`absolute top-1/4 right-1/4 w-20 h-20 rounded-full border ${plan.borderColor} opacity-20`} />
      <div className={`absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full border ${plan.borderColor} opacity-15`} />
    </div>
  );
});

// Card animation variants - transform + opacity only
const getCardVariants = (direction: "down" | "up") => ({
  initial: {
    y: direction === "down" ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    y: direction === "down" ? -80 : 80,
    opacity: 0,
    scale: 0.97,
  },
});

const HeroCard = memo(function HeroCard({
  plan,
  direction,
}: {
  plan: typeof planData[0];
  direction: "down" | "up";
}) {
  const PlanIcon = plan.icon;
  const variants = getCardVariants(direction);

  const scrollToSection = useCallback(() => {
    const element = document.querySelector("#precos");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <motion.div
      key={plan.id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: TRANSITION_DURATION,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="absolute inset-0"
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
    >
      <div
        className={`h-full w-full rounded-2xl border-2 ${plan.borderColor} bg-gradient-to-br ${plan.bgGradient} bg-card overflow-visible`}
        style={{
          boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="h-full flex flex-col lg:flex-row p-4 lg:p-5 gap-3 lg:gap-6">
          <div className="flex-[1.2] flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                className={`w-12 h-12 rounded-xl ${plan.badgeBg} flex items-center justify-center shadow-md`}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              >
                <PlanIcon className="w-6 h-6" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Plano {plan.name}</h3>
                  <Badge className={`${plan.badgeBg} text-xs`}>{plan.name}</Badge>
                </div>
                <p className="text-base text-muted-foreground">{plan.tagline}</p>
              </div>
            </div>

            <div className="space-y-2.5 mt-3 lg:mt-4 flex-1">
              {plan.bullets.map((bullet, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04, duration: 0.35 }}
                >
                  <div className={`w-5 h-5 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-base text-foreground leading-snug">{bullet}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-auto pt-2"
            >
              <Button
                onClick={scrollToSection}
                variant={plan.id === "pro" ? "default" : "outline"}
                size="default"
                className="w-full lg:w-auto lg:px-6 font-semibold shadow-md"
              >
                Ver detalhes do plano {plan.name}
              </Button>
            </motion.div>
          </div>

          <div className="flex-[0.8] relative hidden lg:block">
            <IllustrationPanel plan={plan} isActive={true} />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Progress indicator - memoized
const ProgressIndicator = memo(function ProgressIndicator({
  activeIndex,
}: {
  activeIndex: number;
}) {
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
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 ${
              isActive ? `${plan.badgeBg} shadow-lg` : "bg-muted/50 text-muted-foreground"
            }`}
          >
            <PlanIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{plan.name}</span>
            {isActive && (
              <motion.div
                layoutId="activeDot"
                className="w-2 h-2 rounded-full bg-current"
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
});

const MobileCard = memo(function MobileCard({ plan }: { plan: typeof planData[0] }) {
  const PlanIcon = plan.icon;

  const scrollToSection = useCallback(() => {
    const element = document.querySelector("#precos");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className={`rounded-2xl border-2 ${plan.borderColor} bg-gradient-to-br ${plan.bgGradient} bg-card shadow-xl overflow-visible`}
    >
      <div className="p-6">
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

        <Button onClick={scrollToSection} variant={plan.id === "pro" ? "default" : "outline"} className="w-full">
          Ver plano {plan.name}
        </Button>
      </div>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT – scroll-driven, no scroll hijacking
// ============================================================
export function FeaturesSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const prevStep = useRef(0);

  // Use native scroll + IntersectionObserver sentinel approach
  // The section is 300vh tall; CSS sticky keeps the card visible.
  // Three invisible sentinel divs at 0%, 33%, 66% trigger step changes.
  const sentinel0 = useRef<HTMLDivElement>(null);
  const sentinel1 = useRef<HTMLDivElement>(null);
  const sentinel2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;

    const sentinels = [sentinel0.current, sentinel1.current, sentinel2.current];
    if (sentinels.some((s) => !s)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the sentinel closest to center of viewport that is intersecting
        let bestIndex = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-step"));
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = idx;
          }
        });

        if (bestIndex === -1) {
          // Check which sentinel is most visible by checking all
          sentinels.forEach((s, idx) => {
            if (!s) return;
            const rect = s.getBoundingClientRect();
            const vh = window.innerHeight;
            // If sentinel top is above center of viewport, this step is active
            if (rect.top <= vh * 0.5 && rect.bottom >= 0) {
              bestIndex = idx;
            }
          });
        }

        if (bestIndex >= 0 && bestIndex !== prevStep.current) {
          const newDir = bestIndex > prevStep.current ? "down" : "up";
          prevStep.current = bestIndex;
          setDirection(newDir);
          setActiveStep(bestIndex);
        }
      },
      {
        // Trigger when sentinel crosses the middle of the viewport
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sentinels.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, [isMobile]);

  // Fallback: scroll-position-based step detection (no layout thrash — uses scrollY only)
  useEffect(() => {
    if (isMobile) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!sectionRef.current) return;
        // Read only scrollY and cached offsetTop/offsetHeight
        const sectionTop = sectionRef.current.offsetTop;
        const sectionHeight = sectionRef.current.offsetHeight;
        const scrollY = window.scrollY;
        const relativeScroll = scrollY - sectionTop;
        if (relativeScroll < 0 || relativeScroll > sectionHeight) return;

        const progress = relativeScroll / sectionHeight;
        let newStep: number;
        if (progress < 0.33) newStep = 0;
        else if (progress < 0.66) newStep = 1;
        else newStep = 2;

        if (newStep !== prevStep.current) {
          const newDir = newStep > prevStep.current ? "down" : "up";
          prevStep.current = newStep;
          setDirection(newDir);
          setActiveStep(newStep);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // Mobile version
  if (isMobile) {
    return (
      <section id="recursos" className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4">
          <ScrollReveal>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-3">Recursos</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">Principais recursos</h2>
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

  // Desktop: tall section with sticky card — NO scroll hijacking
  return (
    <section
      id="recursos"
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background via-muted/5 to-background"
      style={{ height: "200vh", touchAction: "pan-y" }}
    >
      {/* Invisible sentinels for IntersectionObserver */}
      <div
        ref={sentinel0}
        data-step="0"
        className="absolute left-0 w-full pointer-events-none"
        style={{ top: "0%", height: "33.33%" }}
      />
      <div
        ref={sentinel1}
        data-step="1"
        className="absolute left-0 w-full pointer-events-none"
        style={{ top: "33.33%", height: "33.33%" }}
      />
      <div
        ref={sentinel2}
        data-step="2"
        className="absolute left-0 w-full pointer-events-none"
        style={{ top: "66.66%", height: "33.34%" }}
      />

      {/* Sticky container — stays in view while user scrolls through 300vh */}
      <div
        className="sticky top-[64px] flex flex-col items-center overflow-visible"
        style={{
          height: "calc(100vh - 64px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        <div className="container px-4 h-full flex flex-col py-2">
          {/* Header */}
          <div className="text-center mb-2 shrink-0">
            <Badge variant="secondary" className="mb-1">Recursos</Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-0.5">Principais recursos</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">Role para explorar os planos</p>
          </div>

          {/* Progress indicator */}
          <div className="mb-2 shrink-0">
            <ProgressIndicator activeIndex={activeStep} />
          </div>

          {/* Cards container */}
          <div
            className="relative flex-1 w-full mx-auto overflow-visible"
            style={{
              maxWidth: "min(880px, 92vw)",
              minHeight: "min(340px, calc(100vh - 200px))",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <HeroCard key={planData[activeStep].id} plan={planData[activeStep]} direction={direction} />
            </AnimatePresence>
          </div>

          {/* Scroll hint */}
          <motion.div
            className="text-center mt-1 shrink-0"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-xs text-muted-foreground">
              {activeStep === 0
                ? "Role para ver Pro"
                : activeStep === 1
                ? "Role para ver Premium"
                : "Continue para ver preços"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Use ↑↓ ou scroll • {activeStep + 1} de 3
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
