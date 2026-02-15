import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, TrendingUp, Calculator, FileSpreadsheet, Headphones,
  ArrowRight, Crown, Sparkles, CheckCircle2, Clock, Receipt, Wallet, Target, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbExpenses } from '@/hooks/useDbExpenses';
import { useDbGoals } from '@/hooks/useDbGoals';
import { formatCurrency } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PremiumHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMonthEvents, pendingPayments, isLoading: eventsLoading } = useDbEvents();
  const { totalCurrentMonthExpenses, isLoading: expensesLoading } = useDbExpenses();
  const { currentMonthGoal, isLoading: goalsLoading } = useDbGoals();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const receivedThisMonth = useMemo(() => {
    return currentMonthEvents
      .filter(e => e.paidAt)
      .reduce((sum, e) => sum + e.netValue, 0);
  }, [currentMonthEvents]);

  const toReceive = useMemo(() => {
    return pendingPayments.reduce((sum, e) => sum + e.netValue, 0);
  }, [pendingPayments]);

  const goalAmount = currentMonthGoal?.targetAmount || 0;
  const goalProgress = goalAmount > 0 ? Math.min(Math.round((receivedThisMonth / goalAmount) * 100), 100) : 0;

  const netResult = receivedThisMonth - totalCurrentMonthExpenses;

  const isLoading = eventsLoading || expensesLoading || goalsLoading;

  const premiumFeatureCards = [
    {
      title: 'Alertas Inteligentes',
      description: 'Notificações automáticas',
      icon: Bell,
      path: '/alertas-inteligentes',
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Insights',
      description: 'Tendências e análises',
      icon: TrendingUp,
      path: '/insights',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Resultado Real',
      description: 'Lucro líquido calculado',
      icon: Calculator,
      path: '/resultado-real',
      color: 'bg-green-500/10 text-green-600',
      stat: formatCurrency(netResult),
      statLabel: 'Líquido este mês',
    },
    {
      title: 'Export Contador',
      description: 'Relatório profissional',
      icon: FileSpreadsheet,
      path: '/contador',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  const proFeatureCards = [
    {
      title: 'Recebimentos',
      description: 'Histórico de entradas',
      icon: Receipt,
      path: '/recebimentos',
      color: 'bg-green-500/10 text-green-600',
      stat: formatCurrency(receivedThisMonth),
      statLabel: 'Recebido este mês',
    },
    {
      title: 'Despesas',
      description: 'Controle por categoria',
      icon: Wallet,
      path: '/despesas',
      color: 'bg-red-500/10 text-red-600',
      stat: formatCurrency(totalCurrentMonthExpenses),
      statLabel: 'Este mês',
    },
    {
      title: 'Metas',
      description: 'Progresso mensal',
      icon: Target,
      path: '/metas',
      color: 'bg-amber-500/10 text-amber-600',
      stat: goalAmount > 0 ? `${goalProgress}%` : '—',
      statLabel: 'Atingido',
    },
    {
      title: 'Relatórios',
      description: 'Por local e ranking',
      icon: BarChart3,
      path: '/relatorios',
      color: 'bg-blue-500/10 text-blue-600',
    },
  ];

  if (isLoading) {
    return (
      <AppLayout title="Início">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Início">
      <div className="space-y-6">
        {/* Header with plan badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Olá, {userName}! 👋</h1>
            <p className="text-muted-foreground">Automação e insights completos</p>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        {/* Financial summary - real data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Recebido este mês
                  </p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(receivedThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" /> A receber
                  </p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(toReceive)}</p>
                </div>
              </div>
              {goalAmount > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Meta do mês</span>
                    <span className="font-medium">{formatCurrency(receivedThisMonth)} / {formatCurrency(goalAmount)}</span>
                  </div>
                  <Progress value={goalProgress} className="h-2" />
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Alertas inteligentes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Relatórios avançados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Resultado real</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Suporte prioritário</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium exclusive cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Exclusivo Premium
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
            {premiumFeatureCards.map((card) => (
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
                    <CardDescription className="text-sm mt-1">{card.description}</CardDescription>
                    {card.stat && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-lg font-semibold text-foreground">{card.stat}</p>
                        <p className="text-xs text-muted-foreground">{card.statLabel}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Pro feature cards (included in Premium) */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recursos Pro inclusos
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
            {proFeatureCards.map((card) => (
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
                    <CardDescription className="text-sm mt-1">{card.description}</CardDescription>
                    {card.stat && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-lg font-semibold text-foreground">{card.stat}</p>
                        <p className="text-xs text-muted-foreground">{card.statLabel}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Priority support */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card 
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={() => navigate('/suporte')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Suporte Prioritário</h3>
                  <p className="text-sm text-muted-foreground">Atendimento exclusivo para assinantes Premium</p>
                </div>
                <Button variant="outline">Acessar</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
