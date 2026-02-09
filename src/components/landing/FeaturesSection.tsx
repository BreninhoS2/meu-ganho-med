"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Check,
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";

const planData = [
  {
    id: "start",
    name: "Start",
    description: "Organização básica",
    price: 30,
    icon: Zap,
    color: "primary",
    features: [
      { icon: Calendar, text: "Agenda completa de plantões e consultas" },
      { icon: MapPin, text: "Locais com valores padrão e prazo" },
      { icon: CheckCircle2, text: "Status do evento e pagamento" },
      { icon: Calculator, text: "Cálculo automático do valor líquido" },
      { icon: LayoutDashboard, text: "Dashboard do mês" },
      { icon: CalendarDays, text: "Calendário mensal" },
      { icon: Cloud, text: "Backup na nuvem + multi-dispositivo" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Controle financeiro completo",
    price: 40,
    icon: Sparkles,
    color: "accent-foreground",
    popular: true,
    features: [
      { icon: Check, text: "Tudo do Start" },
      { icon: Clock, text: "Recebimentos inteligentes (7/30 dias)" },
      { icon: Receipt, text: "Despesas básicas" },
      { icon: BarChart3, text: "Relatórios por local e ranking" },
      { icon: Target, text: "Metas mensais + progresso" },
      { icon: FileDown, text: "Exportações CSV e ICS" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Automação + insights",
    price: 70,
    icon: Crown,
    color: "money",
    features: [
      { icon: Check, text: "Tudo do Pro" },
      { icon: Bell, text: "Alertas inteligentes" },
      { icon: TrendingUp, text: "Relatórios avançados (tendências)" },
      { icon: Tags, text: "Despesas avançadas com categorias" },
      { icon: Receipt, text: "Resultado líquido real" },
      { icon: FileSpreadsheet, text: "Export para contador" },
      { icon: Headphones, text: "Suporte prioritário" },
    ],
  },
];

function PlanCard({ 
  plan, 
  isActive, 
  index,
  onSelect 
}: { 
  plan: typeof planData[0]; 
  isActive: boolean;
  index: number;
  onSelect: (planId: string) => void;
}) {
  const PlanIcon = plan.icon;
  
  const colorClasses = {
    primary: {
      bg: "bg-primary/10",
      icon: "text-primary",
      button: "bg-primary text-primary-foreground hover:bg-primary/90",
      border: "border-primary/30",
      badge: "bg-primary text-primary-foreground",
    },
    "accent-foreground": {
      bg: "bg-accent",
      icon: "text-accent-foreground",
      button: "bg-primary text-primary-foreground hover:bg-primary/90",
      border: "border-primary",
      badge: "bg-primary text-primary-foreground",
    },
    money: {
      bg: "bg-money/10",
      icon: "text-money",
      button: "bg-money text-money-foreground hover:bg-money/90",
      border: "border-money/30",
      badge: "bg-money text-money-foreground",
    },
  };

  const colors = colorClasses[plan.color as keyof typeof colorClasses];

  return (
    <motion.div
      className={`absolute inset-0 bg-card rounded-2xl lg:rounded-3xl border-2 shadow-xl overflow-hidden ${
        isActive ? colors.border : "border-border/20"
      }`}
      initial={false}
      animate={{
        y: isActive ? 0 : (index * 20),
        scale: isActive ? 1 : (1 - index * 0.03),
        opacity: isActive ? 1 : 0.4,
        zIndex: isActive ? 30 : (20 - index),
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {/* Popular ribbon */}
      {plan.popular && (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary to-accent" />
      )}

      <div className="p-6 lg:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center`}>
              <PlanIcon className={`w-7 h-7 ${colors.icon}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                {plan.popular && (
                  <Badge className={`${colors.badge} text-xs`}>Mais vendido</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-muted-foreground text-sm">R$</span>
              <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
            </div>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-3 mb-6">
          {plan.features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
              transition={{ delay: isActive ? i * 0.05 : 0 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <span className="text-foreground text-sm lg:text-base">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className={`w-full py-6 text-base font-semibold ${
              plan.popular ? colors.button + " shadow-lg" : ""
            }`}
            variant={plan.popular ? "default" : "outline"}
            onClick={() => onSelect(plan.id)}
          >
            Escolher {plan.name}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MobilePlanCard({ plan, onSelect }: { plan: typeof planData[0]; onSelect: (planId: string) => void }) {
  const PlanIcon = plan.icon;
  
  const colorClasses = {
    primary: { bg: "bg-primary/10", icon: "text-primary", badge: "bg-primary text-primary-foreground" },
    "accent-foreground": { bg: "bg-accent", icon: "text-accent-foreground", badge: "bg-primary text-primary-foreground" },
    money: { bg: "bg-money/10", icon: "text-money", badge: "bg-money text-money-foreground" },
  };
  const colors = colorClasses[plan.color as keyof typeof colorClasses];

  return (
    <div className={`bg-card rounded-2xl border-2 p-5 min-w-[300px] snap-center ${
      plan.popular ? "border-primary shadow-lg" : "border-border/50"
    }`}>
      {plan.popular && (
        <Badge className={`${colors.badge} text-xs mb-3`}>⭐ Mais vendido</Badge>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <PlanIcon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-muted-foreground text-sm">R$</span>
        <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
        <span className="text-muted-foreground text-sm">/mês</span>
      </div>

      <div className="space-y-2 mb-4">
        {plan.features.slice(0, 5).map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${colors.icon}`} />
            <span className="text-sm text-foreground">{feature.text}</span>
          </div>
        ))}
        {plan.features.length > 5 && (
          <p className="text-xs text-muted-foreground">+ {plan.features.length - 5} mais recursos</p>
        )}
      </div>

      <Button 
        className="w-full" 
        variant={plan.popular ? "default" : "outline"}
        onClick={() => onSelect(plan.id)}
      >
        Escolher {plan.name}
      </Button>
    </div>
  );
}

export function FeaturesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to card index (0-2)
  const cardIndex = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 0, 1, 2]);

  useMotionValueEvent(cardIndex, "change", (latest) => {
    if (!isMobile) {
      const index = Math.round(latest);
      setActiveIndex(Math.min(Math.max(index, 0), 2));
    }
  });

  const handleSelectPlan = (planId: string) => {
    if (user) {
      navigate(`/subscribe?plan=${planId}`);
    } else {
      navigate("/auth");
    }
  };

  // Mobile version - horizontal carousel
  if (isMobile) {
    return (
      <section id="recursos" className="py-16 bg-muted/30">
        <div className="container px-4">
          <ScrollReveal>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">Recursos</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Principais recursos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tudo que você precisa para gerenciar sua carreira médica
              </p>
            </div>
          </ScrollReveal>

          {/* Horizontal scroll cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {planData.map((plan) => (
              <MobilePlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop version - scroll-controlled stacked cards
  return (
    <section 
      id="recursos" 
      ref={containerRef}
      className="relative"
      style={{ height: "300vh" }} // 3 cards * 100vh
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden py-20">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Title and info */}
            <div>
              <Badge variant="secondary" className="mb-4">Recursos</Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Principais recursos
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Tudo que você precisa para gerenciar sua carreira médica com eficiência, 
                organizado em planos que crescem com você.
              </p>
              
              {/* Plan indicator dots */}
              <div className="flex items-center gap-3 mb-8">
                {planData.map((plan, index) => (
                  <motion.button
                    key={plan.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      activeIndex === index 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <plan.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{plan.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${((activeIndex + 1) / 3) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {activeIndex + 1} / 3
                </span>
              </div>

              {/* Scroll hint */}
              <motion.div 
                className="mt-8 flex items-center gap-2 text-muted-foreground"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm">Role para explorar os planos</span>
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↓
                </motion.div>
              </motion.div>
            </div>

            {/* Right side - Stacked cards */}
            <div className="relative h-[500px] lg:h-[550px]">
              {/* Background depth cards */}
              <div className="absolute inset-0 translate-y-6 -translate-x-3 bg-muted/30 rounded-2xl lg:rounded-3xl" style={{ zIndex: 5 }} />
              <div className="absolute inset-0 translate-y-12 -translate-x-6 bg-muted/20 rounded-2xl lg:rounded-3xl" style={{ zIndex: 1 }} />
              
              {/* Plan cards */}
              {planData.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={Math.abs(activeIndex - index)}
                  isActive={activeIndex === index}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
