import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CalendarDays, 
  Building2, 
  Receipt, 
  LayoutDashboard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

const quickAccessCards = [
  {
    title: 'Agenda',
    description: 'Gerencie seus plantões e consultas',
    icon: Calendar,
    path: '/agenda',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Calendário',
    description: 'Visão mensal dos seus eventos',
    icon: CalendarDays,
    path: '/calendario',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Locais',
    description: 'Locais cadastrados com valores padrão',
    icon: Building2,
    path: '/locais',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Pagamentos',
    description: 'Status de eventos e pagamentos',
    icon: Receipt,
    path: '/pagamentos',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Dashboard',
    description: 'Resumo do mês atual',
    icon: LayoutDashboard,
    path: '/dashboard',
    color: 'bg-primary/10 text-primary',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StartHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <AppLayout title="Início">
      <div className="space-y-6">
        {/* Header with plan badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {userName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao PlantãoMed
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Plano Start
          </Badge>
        </div>

        {/* Quick access cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {quickAccessCards.map((card) => (
            <motion.div key={card.path} variants={item}>
              <Card 
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => navigate(card.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Desbloqueie mais recursos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Faça upgrade para o Pro e tenha acesso a despesas, relatórios e metas
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/subscribe?plan=pro')}
                  variant="outline"
                  className="hidden sm:flex"
                >
                  Ver planos
                </Button>
              </div>
              <Button 
                onClick={() => navigate('/subscribe?plan=pro')}
                variant="outline"
                className="w-full mt-4 sm:hidden"
              >
                Ver planos
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
