"use client";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Shield, CreditCard, Mail, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function FooterSection() {
  const currentYear = new Date().getFullYear();
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

  return (
    <footer id="contato" className="relative overflow-hidden">
      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 lg:py-20 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="container relative z-10 px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
          >
            Pronto para organizar seus plantões?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            Junte-se a médicos que já simplificaram sua gestão financeira.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleCTAClick}
                className="text-lg px-8 py-6 shadow-xl group"
              >
                Começar agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-card border-t border-border/50">
        <div className="container px-4 py-12 lg:py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4 group">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
                >
                  <Stethoscope className="w-5 h-5 text-primary-foreground" />
                </motion.div>
                <span className="text-xl font-bold text-foreground">PlantãoMed</span>
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6">
                A plataforma completa para médicos organizarem seus plantões, 
                controlarem finanças e crescerem na carreira.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Dados seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Pagamento via Stripe</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a href="#recursos" className="hover:text-primary transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#precos" className="hover:text-primary transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-primary transition-colors">
                    Como funciona
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:contato@plantaomed.com.br" 
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              © {currentYear} PlantãoMed. Feito com 
              <Heart className="w-4 h-4 text-destructive fill-destructive inline mx-1" /> 
              para médicos
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Pagamento seguro via Stripe
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
