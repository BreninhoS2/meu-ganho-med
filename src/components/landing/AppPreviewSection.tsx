"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Stethoscope,
  Bell,
  Target,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react";

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!startOnView || !isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground">
        <span ref={ref}>
          {prefix}{count.toLocaleString('pt-BR')}{suffix}
        </span>
      </p>
    </motion.div>
  );
}

// Mock Dashboard Component
function MockDashboard() {
  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl scale-110" />
      
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative glass rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-border/30"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 h-6 bg-muted/50 rounded-lg mx-4" />
        </div>

        {/* Dashboard content */}
        <div className="space-y-4">
          {/* Summary header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-primary-foreground"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-80">Fevereiro 2026</span>
              <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                12 plantões
              </span>
            </div>
            <p className="text-2xl font-bold">R$ 24.650</p>
            <p className="text-xs opacity-75">Total líquido do mês</p>
          </motion.div>

          {/* Mini stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-background/70 rounded-xl p-3 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Horas</span>
              </div>
              <p className="text-lg font-semibold">144h</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-background/70 rounded-xl p-3 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-money" />
                <span className="text-xs text-muted-foreground">R$/hora</span>
              </div>
              <p className="text-lg font-semibold text-money">R$ 171</p>
            </motion.div>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-background/70 rounded-xl p-3 border border-border/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Meta do mês</span>
              </div>
              <span className="text-xs font-medium text-primary">82%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "82%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Floating icons */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-card shadow-lg border border-border/50 flex items-center justify-center"
        >
          <Calendar className="w-6 h-6 text-primary" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -bottom-3 -left-3 w-10 h-10 rounded-lg bg-card shadow-lg border border-border/50 flex items-center justify-center"
        >
          <Bell className="w-5 h-5 text-accent-foreground" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -right-6 w-10 h-10 rounded-lg bg-money/10 shadow-lg border border-money/20 flex items-center justify-center"
        >
          <DollarSign className="w-5 h-5 text-money" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function AppPreviewSection() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleCTAClick = () => {
    if (user && subscription.subscribed) {
      navigate("/agenda");
    } else if (user) {
      navigate("/subscribe");
    } else {
      navigate("/auth");
    }
  };

  const scrollToPrecos = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = [
    "Registre plantões, consultas e procedimentos em segundos",
    "Acompanhe recebimentos e despesas em tempo real",
    "Visualize suas metas e progresso mensal",
    "Receba alertas de pagamentos próximos do vencimento",
  ];

  return (
    <section className="relative pt-8 pb-20 lg:pt-12 lg:pb-28 overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container relative z-10 px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Veja o <span className="gradient-text">PlantãoMed</span> em ação
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dashboard intuitivo para você focar no que importa: sua carreira médica
          </p>
        </motion.div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 lg:mb-16 max-w-4xl mx-auto">
          <MetricCard
            icon={Calendar}
            label="Plantões no mês"
            value={12}
            delay={0}
          />
          <MetricCard
            icon={DollarSign}
            label="Recebimentos (30 dias)"
            value={18500}
            prefix="R$ "
            delay={0.1}
          />
          <MetricCard
            icon={BarChart3}
            label="Valor líquido estimado"
            value={24650}
            prefix="R$ "
            delay={0.2}
          />
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Controle total da sua vida financeira médica
            </h3>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={handleCTAClick}
                  className="w-full sm:w-auto group"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToPrecos}
                  className="w-full sm:w-auto"
                >
                  Ver planos
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Mock dashboard */}
          <div className="order-1 lg:order-2">
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
