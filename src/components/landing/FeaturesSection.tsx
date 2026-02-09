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

// ============ CONFIGURAÇÃO DO SCROLLYTELLING ============
const CONFIG = {
  DELTA_THRESHOLD: 700,      // Quantidade de scroll acumulado para trocar card (aumentado)
  LOCK_MS: 1200,             // Lock após troca (ms) - mais lento
  MIN_DWELL_MS: 1500,        // Tempo mínimo no card antes de poder trocar
  TRANSITION_DURATION: 0.85, // Duração da animação (segundos)
  TRACKPAD_MULTIPLIER: 0.4,  // Multiplicador para trackpad (delta menor)
  EXIT_THRESHOLD: 500,       // Threshold extra para sair da seção
  MAX_DELTA_PER_FRAME: 80,   // Limitar delta máximo por evento (clamp)
};

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
    nextHint: "Role para ver Pro",
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
    nextHint: "Role para ver Premium",
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
    nextHint: "Continue para ver preços",
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
      <AnimatePresence mode="wait">
        {isActive && plan.floatingIcons.map((icon, i) => (
          <FloatingIcon 
            key={`${plan.id}-${i}`}
            icon={icon}
            delay={i * 0.2}
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

// Directional card animation variants
const getCardVariants = (direction: 'down' | 'up') => ({
  initial: {
    y: direction === 'down' ? 120 : -120,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(8px)',
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    y: direction === 'down' ? -120 : 120,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(8px)',
  },
});

interface HeroCardProps {
  plan: typeof planData[0];
  direction: 'down' | 'up';
}

function HeroCard({ plan, direction }: HeroCardProps) {
  const PlanIcon = plan.icon;
  const variants = getCardVariants(direction);

  const scrollToSection = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      key={plan.id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: CONFIG.TRANSITION_DURATION, 
        ease: [0.4, 0, 0.2, 1],
        filter: { duration: CONFIG.TRANSITION_DURATION * 0.6 },
      }}
      className="absolute inset-0"
    >
      <div 
        className={`
          h-full w-full rounded-3xl border-2 ${plan.borderColor}
          bg-gradient-to-br ${plan.bgGradient} bg-card
          shadow-2xl overflow-visible
        `}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="h-full flex flex-col lg:flex-row p-6 lg:p-10 gap-6 lg:gap-10">
          {/* Content side */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className={`w-14 h-14 rounded-2xl ${plan.badgeBg} flex items-center justify-center shadow-lg`}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              >
                <PlanIcon className="w-7 h-7" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Plano {plan.name}</h3>
                  <Badge className={`${plan.badgeBg} text-xs`}>{plan.name}</Badge>
                </div>
                <p className="text-sm lg:text-base text-muted-foreground">{plan.tagline}</p>
              </div>
            </div>

            {/* Bullets with staggered animation */}
            <div className="space-y-3 mb-6 flex-1">
              {plan.bullets.map((bullet, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                >
                  <div className={`w-5 h-5 rounded-full ${plan.badgeBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm lg:text-base text-foreground">{bullet}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Button 
                onClick={scrollToSection}
                variant={plan.id === "pro" ? "default" : "outline"}
                size="lg"
                className="w-full lg:w-auto lg:px-8 font-semibold shadow-lg"
              >
                Ver detalhes do plano {plan.name}
              </Button>
            </motion.div>
          </div>

          {/* Illustration side */}
          <div className="flex-1 relative hidden lg:block">
            <IllustrationPanel plan={plan} isActive={true} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Progress indicator with scroll feedback
function ProgressIndicator({ 
  activeIndex, 
  scrollProgress,
  isLocked,
  direction,
}: { 
  activeIndex: number; 
  scrollProgress: number;
  isLocked: boolean;
  direction: 'down' | 'up';
}) {
  const progressPercent = Math.min(100, Math.abs(scrollProgress) / CONFIG.DELTA_THRESHOLD * 100);
  const showProgress = progressPercent > 5 && !isLocked;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dots */}
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
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300
                ${isActive ? `${plan.badgeBg} shadow-lg` : 'bg-muted/50 text-muted-foreground'}
              `}
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

      {/* Scroll progress bar */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span>{direction === 'down' ? '↓' : '↑'}</span>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="w-8 text-right">{Math.round(progressPercent)}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock indicator */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground/60"
          >
            Aguarde...
          </motion.div>
        )}
      </AnimatePresence>
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
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Refs for scroll control
  const accumulatedDelta = useRef(0);
  const lastChangeTime = useRef(0);
  const cardAppearedTime = useRef(Date.now());
  const exitAccumulator = useRef(0);

  // Detect if input is trackpad (smaller, more frequent deltas)
  const isTrackpad = useRef(false);
  const lastDeltaTime = useRef(0);
  const deltaHistory = useRef<number[]>([]);

  const detectTrackpad = useCallback((deltaY: number) => {
    const now = Date.now();
    const timeDiff = now - lastDeltaTime.current;
    lastDeltaTime.current = now;

    deltaHistory.current.push(Math.abs(deltaY));
    if (deltaHistory.current.length > 5) {
      deltaHistory.current.shift();
    }

    // Trackpad: small deltas, high frequency
    const avgDelta = deltaHistory.current.reduce((a, b) => a + b, 0) / deltaHistory.current.length;
    isTrackpad.current = avgDelta < 50 && timeDiff < 50;
  }, []);

  // Change step with all guards
  const changeStep = useCallback((newStep: number, newDirection: 'down' | 'up') => {
    const now = Date.now();
    
    // Check lock
    if (now - lastChangeTime.current < CONFIG.LOCK_MS) {
      return false;
    }

    // Check dwell time
    if (now - cardAppearedTime.current < CONFIG.MIN_DWELL_MS) {
      return false;
    }
    
    // Clamp and validate single step
    const clampedStep = Math.max(0, Math.min(2, newStep));
    if (Math.abs(clampedStep - activeStep) !== 1) {
      return false;
    }
    
    if (clampedStep !== activeStep) {
      setDirection(newDirection);
      setActiveStep(clampedStep);
      lastChangeTime.current = now;
      cardAppearedTime.current = now;
      accumulatedDelta.current = 0;
      exitAccumulator.current = 0;
      setScrollProgress(0);
      setIsLocked(true);
      
      // Unlock after lock duration
      setTimeout(() => {
        setIsLocked(false);
      }, CONFIG.LOCK_MS);
      
      return true;
    }
    
    return false;
  }, [activeStep]);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const headerHeight = 80;

    // Check if section is in view
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const isInView = sectionTop <= headerHeight + 100 && sectionBottom >= viewportHeight - 100;

    if (!isInView) {
      setIsPinned(false);
      accumulatedDelta.current = 0;
      exitAccumulator.current = 0;
      setScrollProgress(0);
      return;
    }

    // Detect input type
    detectTrackpad(e.deltaY);

    const rawDelta = e.deltaY;
    // Clamp delta per frame to prevent fast scrolls from triggering instant changes
    const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), CONFIG.MAX_DELTA_PER_FRAME);
    const delta = isTrackpad.current ? clampedDelta * CONFIG.TRACKPAD_MULTIPLIER : clampedDelta;
    const scrollingDown = delta > 0;
    const scrollingUp = delta < 0;

    // Handle exit conditions with extra threshold
    if (scrollingUp && activeStep === 0) {
      exitAccumulator.current += Math.abs(delta);
      if (exitAccumulator.current >= CONFIG.EXIT_THRESHOLD) {
        setIsPinned(false);
        accumulatedDelta.current = 0;
        exitAccumulator.current = 0;
        setScrollProgress(0);
        return;
      }
      e.preventDefault();
      setIsPinned(true);
      return;
    }
    
    if (scrollingDown && activeStep === 2) {
      exitAccumulator.current += Math.abs(delta);
      if (exitAccumulator.current >= CONFIG.EXIT_THRESHOLD) {
        setIsPinned(false);
        accumulatedDelta.current = 0;
        exitAccumulator.current = 0;
        setScrollProgress(0);
        return;
      }
      e.preventDefault();
      setIsPinned(true);
      return;
    }

    // Reset exit accumulator if direction changes
    exitAccumulator.current = 0;

    // Prevent page scroll
    e.preventDefault();
    setIsPinned(true);

    // If locked, ignore accumulation
    if (isLocked) {
      return;
    }

    // Accumulate delta in current direction
    const currentDirection = delta > 0 ? 'down' : 'up';
    const prevDirection = accumulatedDelta.current > 0 ? 'down' : accumulatedDelta.current < 0 ? 'up' : currentDirection;

    // Reset if direction changes
    if (currentDirection !== prevDirection && accumulatedDelta.current !== 0) {
      accumulatedDelta.current = 0;
    }

    accumulatedDelta.current += delta;
    setScrollProgress(accumulatedDelta.current);
    setDirection(currentDirection);

    // Check threshold
    if (Math.abs(accumulatedDelta.current) >= CONFIG.DELTA_THRESHOLD) {
      const newStep = activeStep + (currentDirection === 'down' ? 1 : -1);
      changeStep(newStep, currentDirection);
    }
  }, [activeStep, changeStep, detectTrackpad, isLocked]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const headerHeight = 80;
    const isInView = rect.top <= headerHeight + 100 && rect.bottom >= viewportHeight - 100;

    if (!isInView || isLocked) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        if (activeStep < 2) {
          e.preventDefault();
          changeStep(activeStep + 1, 'down');
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        if (activeStep > 0) {
          e.preventDefault();
          changeStep(activeStep - 1, 'up');
        }
        break;
    }
  }, [activeStep, changeStep, isLocked]);

  // Setup event listeners
  useEffect(() => {
    if (isMobile) return;

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown, isMobile]);

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

  // Desktop version with premium scrollytelling
  return (
    <section 
      id="recursos" 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background via-muted/5 to-background overflow-visible"
      style={{ minHeight: '125vh' }}
    >
      {/* Sticky container */}
      <div 
        className="sticky flex flex-col items-center overflow-visible"
        style={{ 
          top: '80px', 
          height: 'calc(100vh - 80px)',
        }}
      >
        <div className="container px-4 h-full flex flex-col py-2">
          {/* Header */}
          <div className="text-center mb-2 shrink-0">
            <Badge variant="secondary" className="mb-1">Recursos</Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-0.5">
              Principais recursos
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Role para explorar os planos
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-2 shrink-0">
            <ProgressIndicator 
              activeIndex={activeStep} 
              scrollProgress={scrollProgress}
              isLocked={isLocked}
              direction={direction}
            />
          </div>

          {/* Cards container */}
          <div 
            className="relative flex-1 w-full mx-auto overflow-visible"
            style={{ 
              maxWidth: 'min(980px, 92vw)',
              minHeight: 'min(440px, calc(100vh - 200px))',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <HeroCard
                key={planData[activeStep].id}
                plan={planData[activeStep]}
                direction={direction}
              />
            </AnimatePresence>
          </div>

          {/* Scroll hint */}
          <motion.div 
            className="text-center mt-1 shrink-0"
            animate={{ opacity: isLocked ? 0.3 : [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: isLocked ? 0 : Infinity }}
          >
            <p className="text-xs text-muted-foreground">
              {planData[activeStep].nextHint}
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
