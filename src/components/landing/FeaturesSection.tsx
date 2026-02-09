"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
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
  Headphones
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda completa",
    description: "Gerencie plantões e consultas em um calendário intuitivo. Visualize tudo em um só lugar.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: MapPin,
    title: "Locais e valores padrão",
    description: "Configure valores por local e prazo de pagamento. Automatize seus registros.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: CheckCircle2,
    title: "Status de evento e pagamento",
    description: "Acompanhe confirmações e status de pagamento de cada plantão ou consulta.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Calculator,
    title: "Cálculo automático do valor líquido",
    description: "O sistema calcula automaticamente o valor líquido considerando descontos.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard do mês",
    description: "Visão geral com principais métricas: receitas, despesas e resultado.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: CalendarDays,
    title: "Calendário mensal",
    description: "Visualize seus eventos em formato de calendário para melhor planejamento.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Cloud,
    title: "Backup na nuvem + multi-dispositivo",
    description: "Seus dados seguros e sincronizados em tempo real entre todos os seus dispositivos.",
    plan: "Start",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Clock,
    title: "Recebimentos inteligentes 7/30 dias",
    description: "Previsão de recebimentos nos próximos 7 e 30 dias baseada em seus prazos.",
    plan: "Pro",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: BarChart3,
    title: "Relatórios por local e ranking",
    description: "Análise de performance por hospital/clínica. Saiba onde você ganha mais.",
    plan: "Pro",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Target,
    title: "Metas mensais + progresso",
    description: "Defina e acompanhe suas metas de faturamento mensal com indicadores visuais.",
    plan: "Pro",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: FileDown,
    title: "Exportações CSV e ICS",
    description: "Exporte seus dados para Excel ou calendário externo quando precisar.",
    plan: "Pro",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    description: "Receba notificações de pagamentos atrasados e lembretes importantes.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
  {
    icon: TrendingUp,
    title: "Relatórios avançados (tendências)",
    description: "Análise de tendências, projeções e comparativos entre períodos.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
  {
    icon: Tags,
    title: "Despesas avançadas com categorias",
    description: "Categorização detalhada de despesas para melhor controle financeiro.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
  {
    icon: Receipt,
    title: "Resultado líquido real",
    description: "Cálculo preciso do resultado considerando todas as despesas do período.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
  {
    icon: FileSpreadsheet,
    title: "Export para contador",
    description: "Relatórios prontos para enviar à contabilidade no formato adequado.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
  {
    icon: Headphones,
    title: "Suporte prioritário",
    description: "Atendimento diferenciado com resposta mais rápida para suas dúvidas.",
    plan: "Premium",
    color: "bg-money/10",
    iconColor: "text-money",
  },
];

function FeatureCard({ feature, isActive }: { feature: typeof features[0]; isActive: boolean }) {
  const planColors = {
    Start: "bg-primary/10 text-primary border-primary/20",
    Pro: "bg-accent text-accent-foreground border-accent-foreground/20",
    Premium: "bg-money/10 text-money border-money/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.3, y: 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-card rounded-2xl p-6 lg:p-8 border shadow-elevated transition-all ${
        isActive ? "border-primary/20" : "border-border/30"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center shrink-0`}>
          <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
            <Badge variant="outline" className={`text-xs ${planColors[feature.plan as keyof typeof planColors]}`}>
              {feature.plan}
            </Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MobileFeatureCard({ feature }: { feature: typeof features[0] }) {
  const planColors = {
    Start: "bg-primary/10 text-primary border-primary/20",
    Pro: "bg-accent text-accent-foreground border-accent-foreground/20",
    Premium: "bg-money/10 text-money border-money/20",
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border/50 shadow-soft min-w-[280px] snap-center">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center shrink-0`}>
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-base font-semibold text-foreground truncate">{feature.title}</h3>
            <Badge variant="outline" className={`text-xs shrink-0 ${planColors[feature.plan as keyof typeof planColors]}`}>
              {feature.plan}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isMobile) {
      const index = Math.min(
        Math.floor(latest * features.length),
        features.length - 1
      );
      setActiveIndex(index);
    }
  });

  // Group features by plan for desktop display
  const startFeatures = features.filter(f => f.plan === "Start");
  const proFeatures = features.filter(f => f.plan === "Pro");
  const premiumFeatures = features.filter(f => f.plan === "Premium");

  if (isMobile) {
    return (
      <section id="recursos" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        
        <div className="container relative z-10 px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">Recursos</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Principais recursos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tudo que você precisa para gerenciar sua carreira médica com eficiência
              </p>
            </div>
          </ScrollReveal>

          {/* Mobile carousel */}
          <div className="space-y-8">
            {/* Start features */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 px-1">Plano Start</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {startFeatures.map((feature) => (
                  <MobileFeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>

            {/* Pro features */}
            <div>
              <h3 className="text-sm font-semibold text-accent-foreground mb-3 px-1">Plano Pro</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {proFeatures.map((feature) => (
                  <MobileFeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>

            {/* Premium features */}
            <div>
              <h3 className="text-sm font-semibold text-money mb-3 px-1">Plano Premium</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {premiumFeatures.map((feature) => (
                  <MobileFeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="recursos" 
      ref={containerRef}
      className="relative"
      style={{ height: `${(features.length + 1) * 60}vh` }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Title */}
            <div>
              <Badge variant="secondary" className="mb-4">Recursos</Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Principais recursos
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Tudo que você precisa para gerenciar sua carreira médica com eficiência, 
                organizado em planos que crescem com você.
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    style={{ 
                      width: `${((activeIndex + 1) / features.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {activeIndex + 1} / {features.length}
                </span>
              </div>

              {/* Plan legend */}
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-foreground" />
                  <span className="text-sm text-muted-foreground">Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-money" />
                  <span className="text-sm text-muted-foreground">Premium</span>
                </div>
              </div>
            </div>

            {/* Right side - Stacked cards */}
            <div ref={stackRef} className="relative h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  <FeatureCard 
                    feature={features[activeIndex]} 
                    isActive={true}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Background cards for depth effect */}
              <motion.div
                className="absolute inset-0 translate-y-4 -translate-x-2 opacity-30 pointer-events-none"
                style={{ zIndex: -1 }}
              >
                <div className="bg-card rounded-2xl h-full border border-border/20 shadow-soft" />
              </motion.div>
              <motion.div
                className="absolute inset-0 translate-y-8 -translate-x-4 opacity-15 pointer-events-none"
                style={{ zIndex: -2 }}
              >
                <div className="bg-card rounded-2xl h-full border border-border/10" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
