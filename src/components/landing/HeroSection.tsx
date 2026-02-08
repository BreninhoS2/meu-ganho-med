"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollReveal } from "./ScrollReveal";
import { Calendar, DollarSign, BarChart3, Shield, CreditCard, XCircle } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleCTAClick = () => {
    if (user && subscription.subscribed) {
      navigate("/agenda");
    } else {
      navigate("/subscribe");
    }
  };

  const scrollToPrecos = () => {
    const element = document.querySelector("#precos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Gradient Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
      />

      <div className="container relative z-10 px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal delay={0}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              ✨ Gestão inteligente para médicos
            </Badge>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Gestão de plantões médicos{" "}
              <span className="text-primary">sem dor de cabeça</span>
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Organize seus plantões, controle recebimentos e despesas, acompanhe metas 
              e gere relatórios e alertas inteligentes. Tudo em um só lugar.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  size="lg" 
                  onClick={handleCTAClick}
                  className="text-lg px-8 py-6 shadow-prominent"
                >
                  Começar agora
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={scrollToPrecos}
                  className="text-lg px-8 py-6"
                >
                  Ver planos
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Social Proof */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-0">Mais vendido: Pro</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pagamentos via Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* App Preview */}
        <ScrollReveal delay={0.5}>
          <div className="mt-16 max-w-5xl mx-auto">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent rounded-2xl blur-2xl" />
              
              {/* Preview Cards */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-prominent">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Agenda Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-background/50 rounded-xl p-4 border border-border/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Agenda</p>
                        <p className="text-xs text-muted-foreground">5 eventos este mês</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-accent/50 rounded-full w-full" />
                      <div className="h-2 bg-accent/50 rounded-full w-3/4" />
                      <div className="h-2 bg-accent/50 rounded-full w-1/2" />
                    </div>
                  </motion.div>

                  {/* Financeiro Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-background/50 rounded-xl p-4 border border-border/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-money/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-money" />
                      </div>
                      <div>
                        <p className="font-semibold">Financeiro</p>
                        <p className="text-xs text-muted-foreground">R$ 12.500 este mês</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      <div className="flex-1 bg-primary/20 rounded-t h-4" />
                      <div className="flex-1 bg-primary/30 rounded-t h-6" />
                      <div className="flex-1 bg-primary/40 rounded-t h-8" />
                      <div className="flex-1 bg-primary/50 rounded-t h-10" />
                      <div className="flex-1 bg-primary rounded-t h-12" />
                    </div>
                  </motion.div>

                  {/* Relatórios Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-background/50 rounded-xl p-4 border border-border/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Relatórios</p>
                        <p className="text-xs text-muted-foreground">Insights em tempo real</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-accent/30 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Plantões</p>
                        <p className="font-bold text-primary">12</p>
                      </div>
                      <div className="bg-accent/30 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Consultas</p>
                        <p className="font-bold text-primary">28</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
