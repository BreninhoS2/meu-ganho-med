"use client";

import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
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
    description: "Gerencie plantões e consultas em um calendário intuitivo",
    plan: null,
  },
  {
    icon: MapPin,
    title: "Locais e valores",
    description: "Configure valores padrão por local e prazo de pagamento",
    plan: null,
  },
  {
    icon: CheckCircle2,
    title: "Status de eventos",
    description: "Acompanhe confirmações e status de pagamento",
    plan: null,
  },
  {
    icon: Calculator,
    title: "Valor líquido",
    description: "Cálculo automático considerando descontos",
    plan: null,
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard mensal",
    description: "Visão geral do mês com principais métricas",
    plan: null,
  },
  {
    icon: CalendarDays,
    title: "Calendário visual",
    description: "Visualize seus eventos em formato de calendário",
    plan: null,
  },
  {
    icon: Cloud,
    title: "Backup na nuvem",
    description: "Seus dados seguros e sincronizados",
    plan: null,
  },
  {
    icon: Clock,
    title: "Recebimentos inteligentes",
    description: "Previsão de recebimentos nos próximos 7 e 30 dias",
    plan: "Pro",
  },
  {
    icon: Receipt,
    title: "Gestão de despesas",
    description: "Controle suas despesas profissionais",
    plan: "Pro",
  },
  {
    icon: BarChart3,
    title: "Relatórios por local",
    description: "Análise de performance por hospital/clínica",
    plan: "Pro",
  },
  {
    icon: Target,
    title: "Metas mensais",
    description: "Defina e acompanhe suas metas de faturamento",
    plan: "Pro",
  },
  {
    icon: FileDown,
    title: "Exportação CSV/ICS",
    description: "Exporte dados para Excel ou calendário",
    plan: "Pro",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    description: "Notificações de pagamentos atrasados",
    plan: "Premium",
  },
  {
    icon: TrendingUp,
    title: "Relatórios avançados",
    description: "Análise de tendências e projeções",
    plan: "Premium",
  },
  {
    icon: Tags,
    title: "Despesas por categoria",
    description: "Categorização avançada de despesas",
    plan: "Premium",
  },
  {
    icon: FileSpreadsheet,
    title: "Export para contador",
    description: "Relatórios prontos para contabilidade",
    plan: "Premium",
  },
];

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />

      <div className="container relative z-10 px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Principais recursos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua carreira médica com eficiência
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" staggerDelay={0.05}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.15)" }}
                transition={{ duration: 0.2 }}
                className="relative bg-card border border-border/50 rounded-xl p-5 h-full group"
              >
                {/* Plan Badge */}
                {feature.plan && (
                  <Badge 
                    variant={feature.plan === "Premium" ? "default" : "secondary"}
                    className="absolute -top-2 -right-2 text-xs"
                  >
                    {feature.plan}
                  </Badge>
                )}

                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
