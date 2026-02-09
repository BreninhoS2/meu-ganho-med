"use client";

import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CreditCard, Rocket, ArrowRight } from "lucide-react";
const steps = [{
  icon: UserPlus,
  number: "01",
  title: "Crie sua conta",
  description: "Cadastro rápido e seguro. Em menos de 1 minuto você já pode começar a usar o PlantãoMed.",
  color: "from-primary/20 to-primary/5",
  iconBg: "bg-primary/10",
  iconColor: "text-primary"
}, {
  icon: CreditCard,
  number: "02",
  title: "Escolha seu plano",
  description: "Selecione Start, Pro ou Premium. Sem fidelidade, cancele quando quiser.",
  color: "from-accent/40 to-accent/10",
  iconBg: "bg-accent",
  iconColor: "text-accent-foreground"
}, {
  icon: Rocket,
  number: "03",
  title: "Comece a usar",
  description: "Registre plantões, acompanhe finanças e deixe o sistema trabalhar por você.",
  color: "from-money/20 to-money/5",
  iconBg: "bg-money/10",
  iconColor: "text-money"
}];
export function HowItWorksSection() {
  return <section id="como-funciona" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      </div>

      <div className="container relative z-10 px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Como funciona</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Três passos simples
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transforme sua gestão de plantões em minutos
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => <StaggerItem key={step.number}>
              <motion.div whileHover={{
            y: -8
          }} transition={{
            duration: 0.3,
            ease: "easeOut"
          }} className="relative h-full">
                {/* Connecting arrow (hidden on mobile) */}
                {index < steps.length - 1 && <div className="hidden md:flex absolute top-16 -right-4 lg:-right-5 w-8 lg:w-10 items-center justify-center z-10">
                    <motion.div initial={{
                opacity: 0,
                x: -10
              }} whileInView={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.5 + index * 0.2
              }} viewport={{
                once: true
              }}>
                      <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
                    </motion.div>
                  </div>}

                <div className={`relative bg-card border border-border/50 rounded-2xl p-8 lg:p-10 shadow-elevated group overflow-hidden h-full min-h-[280px]`}>
                  {/* Gradient background on hover */}
                  <div className="" />
                  
                  {/* Step number badge */}
                  <motion.div className="absolute -top-3 left-8 bg-primary text-primary-foreground text-sm font-bold w-10 h-10 rounded-full items-center justify-center flex flex-row mb-0 shadow-lg" whileHover={{
                scale: 1.05
              }}>
                    {step.number}
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 pt-6">
                    {/* Icon */}
                    <motion.div className={`w-14 h-14 rounded-xl ${step.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} whileHover={{
                  rotate: [0, -5, 5, 0]
                }} transition={{
                  duration: 0.5
                }}>
                      <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                    </motion.div>

                    {/* Text */}
                    <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>)}
        </StaggerContainer>
      </div>
    </section>;
}