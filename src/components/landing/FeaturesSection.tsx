"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
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
  Headphones,
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";

const planFeatures = [
  {
    id: "start",
    name: "Start",
    icon: Zap,
    color: "primary",
    features: [
      { icon: Calendar, title: "Agenda completa", description: "Gerencie plantões e consultas em um calendário intuitivo" },
      { icon: MapPin, title: "Locais e valores padrão", description: "Configure valores por local e prazo de pagamento" },
      { icon: CheckCircle2, title: "Status de evento e pagamento", description: "Acompanhe confirmações e status de pagamento" },
      { icon: Calculator, title: "Cálculo automático", description: "Valor líquido calculado automaticamente" },
      { icon: LayoutDashboard, title: "Dashboard do mês", description: "Visão geral com principais métricas" },
      { icon: CalendarDays, title: "Calendário mensal", description: "Visualize eventos em formato de calendário" },
      { icon: Cloud, title: "Backup na nuvem", description: "Dados sincronizados em todos os dispositivos" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    color: "accent-foreground",
    features: [
      { icon: Clock, title: "Recebimentos 7/30 dias", description: "Previsão de recebimentos baseada em seus prazos" },
      { icon: Receipt, title: "Despesas básicas", description: "Controle de despesas do período" },
      { icon: BarChart3, title: "Relatórios por local", description: "Análise de performance por hospital/clínica" },
      { icon: Target, title: "Metas mensais", description: "Defina e acompanhe suas metas de faturamento" },
      { icon: FileDown, title: "Exportações CSV/ICS", description: "Exporte dados para Excel ou calendário" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    color: "money",
    features: [
      { icon: Bell, title: "Alertas inteligentes", description: "Notificações de pagamentos atrasados" },
      { icon: TrendingUp, title: "Relatórios avançados", description: "Análise de tendências e projeções" },
      { icon: Tags, title: "Despesas por categoria", description: "Categorização detalhada de despesas" },
      { icon: Receipt, title: "Resultado líquido real", description: "Cálculo preciso do resultado" },
      { icon: FileSpreadsheet, title: "Export para contador", description: "Relatórios prontos para contabilidade" },
      { icon: Headphones, title: "Suporte prioritário", description: "Atendimento diferenciado" },
    ],
  },
];

function FeatureCard({ feature, planColor }: { feature: typeof planFeatures[0]["features"][0]; planColor: string }) {
  const colorClasses = {
    primary: { bg: "bg-primary/10", icon: "text-primary" },
    "accent-foreground": { bg: "bg-accent", icon: "text-accent-foreground" },
    money: { bg: "bg-money/10", icon: "text-money" },
  };
  const colors = colorClasses[planColor as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
          <feature.icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PlanSection({ plan, index }: { plan: typeof planFeatures[0]; index: number }) {
  const PlanIcon = plan.icon;
  const colorClasses = {
    primary: { badge: "bg-primary/10 text-primary border-primary/20", icon: "text-primary", bg: "bg-primary/5" },
    "accent-foreground": { badge: "bg-accent text-accent-foreground border-accent-foreground/20", icon: "text-accent-foreground", bg: "bg-accent/30" },
    money: { badge: "bg-money/10 text-money border-money/20", icon: "text-money", bg: "bg-money/5" },
  };
  const colors = colorClasses[plan.color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="mb-12 last:mb-0">
        {/* Plan header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <PlanIcon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">Plano {plan.name}</h3>
            <Badge variant="outline" className={colors.badge}>
              {plan.name}
            </Badge>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} planColor={plan.color} />
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function MobileFeatureCard({ feature, planName, planColor }: { 
  feature: typeof planFeatures[0]["features"][0]; 
  planName: string;
  planColor: string;
}) {
  const colorClasses = {
    primary: { bg: "bg-primary/10", icon: "text-primary", badge: "bg-primary/10 text-primary" },
    "accent-foreground": { bg: "bg-accent", icon: "text-accent-foreground", badge: "bg-accent text-accent-foreground" },
    money: { bg: "bg-money/10", icon: "text-money", badge: "bg-money/10 text-money" },
  };
  const colors = colorClasses[planColor as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm min-w-[260px] snap-center">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <feature.icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
          {planName}
        </Badge>
      </div>
      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const isMobile = useIsMobile();

  // Mobile version - horizontal carousels by plan
  if (isMobile) {
    return (
      <section id="recursos" className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">Recursos</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Principais recursos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tudo que você precisa para gerenciar sua carreira médica
              </p>
            </div>
          </ScrollReveal>

          {/* Mobile carousels by plan */}
          <div className="space-y-8">
            {planFeatures.map((plan) => (
              <div key={plan.id}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <plan.icon className={`w-4 h-4 ${
                    plan.color === 'primary' ? 'text-primary' : 
                    plan.color === 'accent-foreground' ? 'text-accent-foreground' : 
                    'text-money'
                  }`} />
                  <h3 className="text-sm font-semibold text-foreground">Plano {plan.name}</h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                  {plan.features.map((feature) => (
                    <MobileFeatureCard 
                      key={feature.title} 
                      feature={feature} 
                      planName={plan.name}
                      planColor={plan.color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop version - organized by plan sections
  return (
    <section id="recursos" className="py-20 lg:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container px-4">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Recursos</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Principais recursos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua carreira médica com eficiência, 
              organizado em planos que crescem com você.
            </p>
          </div>
        </ScrollReveal>

        {/* Plan sections */}
        <div className="max-w-6xl mx-auto">
          {planFeatures.map((plan, index) => (
            <PlanSection key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
