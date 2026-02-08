"use client";

import { ScrollReveal } from "./ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento. Não há fidelidade nem multas. Sua assinatura continuará ativa até o fim do período já pago.",
  },
  {
    question: "Como funciona a mudança de plano?",
    answer: "Você pode fazer upgrade ou downgrade a qualquer momento. Ao fazer upgrade, você terá acesso imediato às novas funcionalidades. O valor será calculado proporcionalmente ao período restante.",
  },
  {
    question: "O que acontece se eu não renovar?",
    answer: "Seus dados ficam seguros e acessíveis por 30 dias após o cancelamento. Você pode reativar sua assinatura a qualquer momento e recuperar todos os seus dados.",
  },
  {
    question: "Como funciona o bloqueio de recursos por plano?",
    answer: "Cada plano tem acesso a funcionalidades específicas. Se você tentar acessar uma função não disponível no seu plano atual, verá uma mensagem sugerindo o upgrade. Todas as suas informações básicas (agenda, locais) estão sempre disponíveis.",
  },
  {
    question: "Os pagamentos são seguros?",
    answer: "Absolutamente! Utilizamos o Stripe, uma das plataformas de pagamento mais seguras do mundo. Não armazenamos dados do seu cartão - tudo é processado diretamente pelo Stripe com criptografia de ponta a ponta.",
  },
  {
    question: "Posso usar em múltiplos dispositivos?",
    answer: "Sim! Sua conta funciona em qualquer dispositivo com acesso à internet. Seus dados são sincronizados em tempo real na nuvem, então você pode começar no celular e continuar no computador.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Todos os planos têm acesso ao suporte por email. Usuários Premium têm suporte prioritário com resposta mais rápida e atendimento diferenciado.",
  },
  {
    question: "Existe versão gratuita ou período de teste?",
    answer: "Atualmente não oferecemos plano gratuito nem período de teste. Porém, nossos preços são acessíveis e você pode cancelar a qualquer momento se não ficar satisfeito.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="container relative z-10 px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre o PlantãoMed
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-elevated transition-shadow"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
