"use client";

import { Link } from "react-router-dom";
import { Stethoscope, Shield, CreditCard, Mail } from "lucide-react";

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contato" className="bg-card border-t border-border/50">
      <div className="container px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PlantãoMed</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              A plataforma completa para médicos organizarem seus plantões, 
              controlarem finanças e crescerem na carreira.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Dados seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pagamento via Stripe</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="#recursos" className="hover:text-foreground transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#precos" className="hover:text-foreground transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
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
                <a href="#" className="hover:text-foreground transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contato@plantaomed.com.br" 
                  className="hover:text-foreground transition-colors flex items-center gap-2"
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
          <p>© {currentYear} PlantãoMed. Todos os direitos reservados.</p>
          <p className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pagamento seguro via Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
