"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Stethoscope, Calendar, DollarSign, BarChart3, Bell, FileText, Settings, Shield, Zap, Target, User, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const productItems = [
  { icon: Calendar, label: "Agenda de Plantões", description: "Organize seus plantões e consultas", href: "#recursos" },
  { icon: DollarSign, label: "Gestão Financeira", description: "Controle recebimentos e despesas", href: "#recursos" },
  { icon: BarChart3, label: "Relatórios", description: "Insights sobre sua performance", href: "#recursos" },
];

const solutionsItems = [
  { icon: Stethoscope, label: "Para Médicos", description: "Gestão completa da sua carreira", href: "#como-funciona" },
  { icon: Target, label: "Metas Mensais", description: "Defina e acompanhe seus objetivos", href: "#recursos" },
  { icon: Shield, label: "Dados Seguros", description: "Backup na nuvem com criptografia", href: "#recursos" },
];

const resourcesItems = [
  { icon: Bell, label: "Alertas Inteligentes", description: "Notificações de pagamentos", href: "#recursos" },
  { icon: FileText, label: "Exportações", description: "CSV, ICS e relatórios", href: "#recursos" },
  { icon: Settings, label: "Configurações", description: "Personalize sua experiência", href: "#recursos" },
];

interface NavDropdownMenuProps {
  items: typeof productItems;
  isOpen: boolean;
}

function NavDropdownMenu({ items, isOpen }: NavDropdownMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-prominent p-2 z-50"
        >
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCTAClick = () => {
    if (user && subscription.subscribed) {
      navigate("/agenda");
    } else {
      navigate("/subscribe");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Produto", items: productItems, id: "produto" },
    { label: "Soluções", items: solutionsItems, id: "solucoes" },
    { label: "Recursos", items: resourcesItems, id: "recursos" },
    { label: "Preços", href: "#precos", id: "precos" },
    { label: "FAQ", href: "#faq", id: "faq" },
    { label: "Contato", href: "#contato", id: "contato" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-soft"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold text-foreground">PlantãoMed</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => item.items && setOpenDropdown(item.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.items ? (
                      <button
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          openDropdown === item.id && "rotate-180"
                        )} />
                      </button>
                    ) : (
                      <button
                        onClick={() => item.href && scrollToSection(item.href)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </button>
                    )}
                    {item.items && (
                      <NavDropdownMenu items={item.items} isOpen={openDropdown === item.id} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground max-w-[150px] truncate">
                          {user.user_metadata?.name || user.email}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-prominent z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium">{user.user_metadata?.name || 'Minha Conta'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => navigate("/config")} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Minha conta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/subscribe")} className="cursor-pointer">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Plano / Assinatura
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleCTAClick} className="shadow-elevated">
                      {subscription.subscribed ? 'Ir para Agenda' : 'Escolher plano'}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Fazer login
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleCTAClick} className="shadow-elevated">
                      Comece agora
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-foreground"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-background lg:hidden pt-16"
          >
            <div className="p-4 space-y-2 overflow-y-auto h-full pb-32">
              {navItems.map((item) => (
                <div key={item.id} className="border-b border-border/50">
                  {item.items ? (
                    <>
                      <button
                        onClick={() => setMobileAccordion(mobileAccordion === item.id ? null : item.id)}
                        className="flex items-center justify-between w-full py-4 text-left font-medium"
                      >
                        {item.label}
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform duration-200",
                          mobileAccordion === item.id && "rotate-180"
                        )} />
                      </button>
                      <AnimatePresence>
                        {mobileAccordion === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 space-y-2">
                              {item.items.map((subItem) => (
                                <a
                                  key={subItem.label}
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/30"
                                >
                                  <subItem.icon className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm">{subItem.label}</p>
                                    <p className="text-xs text-muted-foreground">{subItem.description}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.href) scrollToSection(item.href);
                      }}
                      className="block w-full py-4 text-left font-medium"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-6 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.user_metadata?.name || 'Minha Conta'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/config");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Minha conta
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/subscribe");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Plano / Assinatura
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleCTAClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {subscription.subscribed ? 'Ir para Agenda' : 'Escolher plano'}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Fazer login
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleCTAClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Comece agora
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
