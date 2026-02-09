"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollReveal } from "./ScrollReveal";
import { 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Stethoscope, 
  Heart,
  Activity,
  Plus,
  Clock,
  Shield,
  Users,
  ArrowRight
} from "lucide-react";

export function HeroSection() {
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 lg:pt-24">
      {/* Background gradient shapes */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated gradient blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 -left-40 w-[600px] h-[600px] rounded-full gradient-blob blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-20 -right-40 w-[500px] h-[500px] rounded-full gradient-blob blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/20 blur-3xl"
      />

      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-32 left-[10%] w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-float hidden lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Stethoscope className="w-6 h-6 text-primary/60" />
      </motion.div>
      <motion.div
        className="absolute top-48 right-[15%] w-10 h-10 rounded-lg bg-accent/40 flex items-center justify-center animate-float-delayed hidden lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Heart className="w-5 h-5 text-primary/50" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[15%] w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center animate-float-slow hidden lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <Activity className="w-7 h-7 text-primary/40" />
      </motion.div>
      <motion.div
        className="absolute bottom-48 right-[10%] w-8 h-8 rounded-md bg-accent/30 flex items-center justify-center animate-float hidden lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <Plus className="w-4 h-4 text-primary/50" />
      </motion.div>

      {/* Dotted pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="container relative z-10 px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <ScrollReveal delay={0}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  ✨ Gestão inteligente para médicos
                </Badge>
              </motion.div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] mb-6">
                Gestão de plantões médicos{" "}
                <span className="gradient-text">sem dor de cabeça</span>
              </h1>
            </ScrollReveal>

            {/* Subheadline */}
            <ScrollReveal delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Organize seus plantões, controle recebimentos e despesas, acompanhe metas 
                e gere relatórios e alertas inteligentes. Tudo em um só lugar.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    size="lg" 
                    onClick={handleCTAClick}
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto group"
                  >
                    Começar agora
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={scrollToPrecos}
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    Ver planos
                  </Button>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Trust indicators */}
            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Dados seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Multi-dispositivo</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right content - App Preview */}
          <ScrollReveal delay={0.5} direction="right">
            <div className="relative">
              {/* Glow effect behind cards */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl scale-110" />
              
              {/* Main preview container */}
              <motion.div
                initial={{ y: 40, opacity: 0, rotateX: 10 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="relative"
                style={{ perspective: 1000 }}
              >
                <div className="relative glass rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl">
                  {/* Preview header */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-warning/60" />
                      <div className="w-3 h-3 rounded-full bg-success/60" />
                    </div>
                    <div className="flex-1 h-6 bg-muted/50 rounded-lg mx-4" />
                  </div>

                  {/* Preview cards grid */}
                  <div className="grid gap-4">
                    {/* Agenda Card */}
                    <motion.div
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="bg-background/70 rounded-xl p-4 border border-border/30"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">Agenda do Mês</p>
                          <p className="text-xs text-muted-foreground">8 plantões • 12 consultas</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Hoje</Badge>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className={`h-8 rounded ${i === 2 || i === 5 ? 'bg-primary/20' : 'bg-muted/30'}`} />
                        ))}
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Financial Card */}
                      <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="bg-background/70 rounded-xl p-4 border border-border/30"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-money/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-money" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Este mês</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground mb-1">R$ 18.500</p>
                        <div className="flex items-end gap-0.5 h-10">
                          {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40" 
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </motion.div>

                      {/* Stats Card */}
                      <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="bg-background/70 rounded-xl p-4 border border-border/30"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-accent-foreground" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Métricas</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Meta</span>
                            <span className="text-xs font-medium text-primary">78%</span>
                          </div>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '78%' }}
                              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Floating notification card */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 glass rounded-xl p-3 shadow-lg hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pagamento recebido</p>
                      <p className="text-xs text-muted-foreground">Hospital São Lucas</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
