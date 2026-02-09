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
  DELTA_THRESHOLD: 900,        // Aumentado: mais scroll para trocar card
  LOCK_MS: 1600,               // Lock mais longo após troca
  MIN_DWELL_MS: 1800,          // Tempo mínimo no card antes de poder trocar
  TRANSITION_DURATION: 0.75,   // Duração da animação (segundos)
  TRACKPAD_MULTIPLIER: 0.25,   // Multiplicador menor para trackpad
  EXIT_ARMED_MS: 600,           // How long to prevent re-pinning after edge exit
  MAX_DELTA_PER_FRAME: 60,     // Limitar delta máximo por evento (mais restritivo)
  TRANSITION_COOLDOWN: 900,    // Cooldown adicional durante transição
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

// Floating icon component with animation - optimized
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
      className={`absolute w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${color} flex items-center justify-center shadow-lg will-change-transform`}
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

// Illustration panel for each card - optimized
function IllustrationPanel({ plan, isActive }: { plan: typeof planData[0]; isActive: boolean }) {
  const positions = [
    { top: '8%', right: '8%' },
    { top: '20%', left: '4%' },
    { bottom: '15%', right: '12%' },
    { bottom: '8%', left: '8%' },
  ];

  const colorClasses: Record<string, string> = {
    primary: "bg-primary/20 text-primary",
    "accent-foreground": "bg-accent text-accent-foreground",
    money: "bg-money/20 text-money",
  };

  return (
    <div className="relative w-full h-full min-h-[160px] lg:min-h-[200px]">
      {/* Central glow - simplified for performance */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-radial ${plan.bgGradient} opacity-40`}
      />
      
      {/* Main icon in center */}
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 lg:w-20 lg:h-20 rounded-xl ${colorClasses[plan.color]} flex items-center justify-center shadow-xl will-change-transform`}
        animate={{ 
          scale: isActive ? [1, 1.05, 1] : 0.9,
          rotate: isActive ? [0, 2, 0, -2, 0] : 0,
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <plan.icon className="w-8 h-8 lg:w-10 lg:h-10" />
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

      {/* Decorative circles - static for performance */}
      <div
        className={`absolute top-1/4 right-1/4 w-20 h-20 rounded-full border ${plan.borderColor} opacity-20`}
      />
      <div
        className={`absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full border ${plan.borderColor} opacity-15`}
      />
    </div>
  );
}

// Directional card animation variants - optimized with transform only
const getCardVariants = (direction: 'down' | 'up') => ({
  initial: {
    y: direction === 'down' ? 100 : -100,
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    y: direction === 'down' ? -100 : 100,
    opacity: 0,
    scale: 0.97,
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
      }}
      className="absolute inset-0 will-change-transform"
    >
      <div 
        className={`
          h-full w-full rounded-2xl border-2 ${plan.borderColor}
          bg-gradient-to-br ${plan.bgGradient} bg-card
          shadow-xl overflow-visible
        `}
        style={{
          boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="h-full flex flex-col lg:flex-row p-4 lg:p-5 gap-3 lg:gap-6">
          {/* Content side */}
          <div className="flex-[1.2] flex flex-col">
            {/* Header */}
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

            {/* Bullets with staggered animation */}
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

            {/* CTA */}
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

          {/* Illustration side */}
          <div className="flex-[0.8] relative hidden lg:block">
            <IllustrationPanel plan={plan} isActive={true} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Progress indicator
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
    <div className="flex flex-col items-center gap-2">
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
                style={{ width: `${progressPercent}%` }}
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
  const stickyRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(false);
  
  // Refs for scroll control
  const accumulatedDelta = useRef(0);
  const lastChangeTime = useRef(0);
  const cardAppearedTime = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const pendingDelta = useRef(0);

  // Detect if input is trackpad
  const isTrackpad = useRef(false);
  const lastDeltaTime = useRef(0);
  const deltaHistory = useRef<number[]>([]);
  
  // Cache layout values to avoid forced reflow on every wheel event
  const cachedLayout = useRef<{
    sectionTop: number;
    sectionBottom: number;
    viewportHeight: number;
    headerHeight: number;
    lastUpdate: number;
  } | null>(null);
  
  // Update cached layout values periodically (not on every event)
  const updateLayoutCache = useCallback(() => {
    if (!sectionRef.current) return;
    const now = Date.now();
    // Only update if cache is stale (>100ms old) or doesn't exist
    if (!cachedLayout.current || now - cachedLayout.current.lastUpdate > 100) {
      const rect = sectionRef.current.getBoundingClientRect();
      cachedLayout.current = {
        sectionTop: rect.top,
        sectionBottom: rect.bottom,
        viewportHeight: window.innerHeight,
        headerHeight: 80,
        lastUpdate: now,
      };
    }
    return cachedLayout.current;
  }, []);

  // Lock body scroll when pinned - using class for performance
  useEffect(() => {
    if (isPinned && !isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isPinned, isMobile]);

  // IntersectionObserver to detect when card is visible
  // Respects exitArmed to avoid re-pinning immediately after edge exit
  useEffect(() => {
    if (!stickyRef.current || isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.intersectionRatio >= 0.35;
          // Don't re-activate if we just exited at an edge
          if (visible && exitArmed.current) return;
          setIsCardVisible(visible);
        });
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1] }
    );

    observer.observe(stickyRef.current);

    return () => observer.disconnect();
  }, [isMobile]);

  const detectTrackpad = useCallback((deltaY: number) => {
    const now = Date.now();
    const timeDiff = now - lastDeltaTime.current;
    lastDeltaTime.current = now;

    deltaHistory.current.push(Math.abs(deltaY));
    if (deltaHistory.current.length > 5) {
      deltaHistory.current.shift();
    }

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
    
    // Already transitioning - block completely
    if (isTransitioning) {
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
      
      pendingDelta.current = 0;
      setScrollProgress(0);
      setIsLocked(true);
      setIsTransitioning(true);
      
      // Unlock after lock duration
      setTimeout(() => {
        setIsLocked(false);
      }, CONFIG.LOCK_MS);
      
      // End transition after animation completes + cooldown
      setTimeout(() => {
        setIsTransitioning(false);
      }, CONFIG.TRANSITION_DURATION * 1000 + CONFIG.TRANSITION_COOLDOWN);
      
      return true;
    }
    
    return false;
  }, [activeStep, isTransitioning]);

  // Process scroll with RAF for smooth 180hz
  const processScroll = useCallback(() => {
    if (pendingDelta.current === 0) {
      rafId.current = null;
      return;
    }

    const delta = pendingDelta.current;
    pendingDelta.current = 0;

    // Accumulate delta
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

    rafId.current = null;
  }, [activeStep, changeStep]);

  // Determine if the scrollytelling should consume the scroll event
  const shouldConsumeScroll = useCallback((deltaY: number): boolean => {
    const scrollingDown = deltaY > 0;
    const scrollingUp = deltaY < 0;
    // At edges: let the page scroll freely
    if (activeStep === 0 && scrollingUp) return false;
    if (activeStep === 2 && scrollingDown) return false;
    return true;
  }, [activeStep]);

  // Ref to track exit-armed state so IntersectionObserver doesn't re-pin immediately
  const exitArmed = useRef(false);
  const exitArmedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armExit = useCallback(() => {
    exitArmed.current = true;
    if (exitArmedTimeout.current) clearTimeout(exitArmedTimeout.current);
    // Keep armed for 600ms — enough for the section to leave the viewport
    exitArmedTimeout.current = setTimeout(() => {
      exitArmed.current = false;
    }, 600);
  }, []);

  // Handle wheel events - optimized to avoid forced reflow
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!sectionRef.current) return;

    // Update cache if needed (batched read outside of write operations)
    const now = Date.now();
    if (!cachedLayout.current || now - cachedLayout.current.lastUpdate > 100) {
      updateLayoutCache();
    }

    const layout = cachedLayout.current;
    if (!layout) return;

    const isInView = layout.sectionTop <= layout.headerHeight + 100 && 
                     layout.sectionBottom >= layout.viewportHeight - 100;

    if (!isInView) {
      setIsPinned(false);
      accumulatedDelta.current = 0;
      pendingDelta.current = 0;
      setScrollProgress(0);
      return;
    }

    if (!isCardVisible) return;

    // ── EDGE EXIT: always check first, even during lock/transition ──
    if (!shouldConsumeScroll(e.deltaY)) {
      // Release everything immediately
      setIsPinned(false);
      setIsLocked(false);
      setIsTransitioning(false);
      accumulatedDelta.current = 0;
      pendingDelta.current = 0;
      setScrollProgress(0);
      armExit();
      // Do NOT preventDefault — let the page scroll
      return;
    }

    // Block scroll during transition (but edges already handled above)
    if (isTransitioning || isLocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Detect input type
    detectTrackpad(e.deltaY);

    const rawDelta = e.deltaY;
    const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), CONFIG.MAX_DELTA_PER_FRAME);
    const delta = isTrackpad.current ? clampedDelta * CONFIG.TRACKPAD_MULTIPLIER : clampedDelta;

    // Prevent page scroll and pin
    e.preventDefault();
    e.stopPropagation();
    setIsPinned(true);

    // Accumulate delta and schedule RAF
    pendingDelta.current += delta;
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(processScroll);
    }
  }, [activeStep, detectTrackpad, isLocked, isCardVisible, isTransitioning, processScroll, updateLayoutCache, shouldConsumeScroll, armExit]);

  // Handle touch events for mobile-like gestures
  const touchStartY = useRef(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!sectionRef.current || !isCardVisible) return;

    const layout = cachedLayout.current;
    if (!layout) return;

    const isInView = layout.sectionTop <= layout.headerHeight + 100 && 
                     layout.sectionBottom >= layout.viewportHeight - 100;
    if (!isInView) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchY;

    if (Math.abs(deltaY) > 10) {
      // Edge exit check first
      if (!shouldConsumeScroll(deltaY)) {
        setIsPinned(false);
        setIsLocked(false);
        setIsTransitioning(false);
        accumulatedDelta.current = 0;
        pendingDelta.current = 0;
        setScrollProgress(0);
        armExit();
        touchStartY.current = touchY;
        return; // let page scroll
      }

      if (isTransitioning || isLocked) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      setIsPinned(true);
      
      const clampedDelta = Math.sign(deltaY) * Math.min(Math.abs(deltaY), CONFIG.MAX_DELTA_PER_FRAME);
      pendingDelta.current += clampedDelta * 0.5;
      
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(processScroll);
      }
      
      touchStartY.current = touchY;
    }
  }, [isCardVisible, isLocked, isTransitioning, processScroll, shouldConsumeScroll, armExit]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!sectionRef.current) return;

    // Use cached layout values
    const layout = cachedLayout.current;
    if (!layout) return;

    const isInView = layout.sectionTop <= layout.headerHeight + 100 && 
                     layout.sectionBottom >= layout.viewportHeight - 100;

    if (!isInView || isLocked || isTransitioning) return;

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
  }, [activeStep, changeStep, isLocked, isTransitioning]);

  // Setup event listeners with layout cache updates
  useEffect(() => {
    if (isMobile) return;

    // Initial layout cache
    updateLayoutCache();

    // Update layout cache on scroll (passive, throttled by the cache itself)
    const handleScroll = () => {
      // Clear cache on scroll to force update on next wheel event
      if (cachedLayout.current) {
        cachedLayout.current.lastUpdate = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, isMobile, updateLayoutCache]);

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
      className="relative bg-gradient-to-b from-background via-muted/5 to-background overflow-visible pb-0 mb-0"
      style={{ minHeight: '92vh' }}
    >
      {/* Sticky container */}
      <div 
        ref={stickyRef}
        className="sticky flex flex-col items-center overflow-visible will-change-transform"
        style={{ 
          top: '64px', 
          height: 'calc(100vh - 64px)',
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
              isLocked={isLocked || isTransitioning}
              direction={direction}
            />
          </div>

          {/* Cards container */}
          <div 
            className="relative flex-1 w-full mx-auto overflow-visible"
            style={{ 
              maxWidth: 'min(880px, 92vw)',
              minHeight: 'min(340px, calc(100vh - 200px))',
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
            animate={{ opacity: (isLocked || isTransitioning) ? 0.3 : [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: (isLocked || isTransitioning) ? 0 : Infinity }}
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