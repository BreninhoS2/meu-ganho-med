import { useNavigate } from 'react-router-dom';
import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt, Wallet, Target, BarChart3, Download, ArrowRight, Crown,
  TrendingUp, Clock, Calendar, CalendarDays, Building2, LayoutDashboard,
  ChevronUp, ChevronDown, Settings2, Check
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
import { useUserShortcuts } from '@/hooks/useUserShortcuts';
import { formatCurrency } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

const allShortcuts: Record<string, { title: string; icon: React.ElementType; color: string }> = {
  '/agenda': { title: 'Agenda', icon: Calendar, color: 'bg-teal-500/10 text-teal-600' },
  '/calendario': { title: 'Calendário', icon: CalendarDays, color: 'bg-indigo-500/10 text-indigo-600' },
  '/locais': { title: 'Locais', icon: Building2, color: 'bg-violet-500/10 text-violet-600' },
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboard, color: 'bg-sky-500/10 text-sky-600' },
  '/pagamentos': { title: 'Pagamentos', icon: Receipt, color: 'bg-orange-500/10 text-orange-600' },
  '/recebimentos': { title: 'Recebimentos', icon: Receipt, color: 'bg-green-500/10 text-green-600' },
  '/despesas': { title: 'Despesas', icon: Wallet, color: 'bg-red-500/10 text-red-600' },
  '/metas': { title: 'Metas', icon: Target, color: 'bg-amber-500/10 text-amber-600' },
  '/relatorios': { title: 'Relatórios', icon: BarChart3, color: 'bg-blue-500/10 text-blue-600' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ShortcutCard = memo(function ShortcutCard({ title, icon: Icon, path, color, onClick }: {
  title: string; icon: React.ElementType; path: string; color: string; onClick: (p: string) => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
      onClick={() => onClick(path)}
    >
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
      </CardContent>
    </Card>
  );
});

export default function ProHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMonthEvents, pendingPayments, isLoading: eventsLoading } = useDbEvents();
  const { totalCurrentMonthExpenses, isLoading: expensesLoading } = useDbExpenses();
  const { currentMonthGoal, isLoading: goalsLoading } = useDbGoals();
  const { order, moveUp, moveDown, isLoading: shortcutsLoading } = useUserShortcuts();
  const [editingShortcuts, setEditingShortcuts] = useState(false);

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
  const metasStat = goalAmount > 0 ? `${goalProgress}%` : '—';

  const isLoading = eventsLoading || expensesLoading || goalsLoading || shortcutsLoading;

  const next7DaysTotal = useMemo(() => {
    const now = new Date();
    return pendingPayments
      .filter(e => {
        const payDate = e.paymentDate || e.date;
        const diff = Math.ceil((new Date(payDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
      })
      .reduce((sum, e) => sum + e.netValue, 0);
  }, [pendingPayments]);

  const proFeatureCards = [
    {
      title: 'Recebimentos', description: 'Próximos 7 e 30 dias', icon: Receipt,
      path: '/recebimentos', color: 'bg-green-500/10 text-green-600',
      stat: formatCurrency(next7DaysTotal), statLabel: 'Próx. 7 dias',
    },
    {
      title: 'Despesas', description: 'Controle por categoria', icon: Wallet,
      path: '/despesas', color: 'bg-red-500/10 text-red-600',
      stat: formatCurrency(totalCurrentMonthExpenses), statLabel: 'Este mês',
    },
    {
      title: 'Metas', description: 'Progresso mensal', icon: Target,
      path: '/metas', color: 'bg-amber-500/10 text-amber-600',
      stat: metasStat, statLabel: 'Atingido',
    },
    {
      title: 'Relatórios', description: 'Por local e ranking', icon: BarChart3,
      path: '/relatorios', color: 'bg-blue-500/10 text-blue-600',
    },
  ];

  // Build ordered shortcuts from user preferences
  const orderedShortcuts = useMemo(() => {
    return order
      .filter(path => allShortcuts[path])
      .map(path => ({ path, ...allShortcuts[path] }));
  }, [order]);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Olá, {userName}! 👋</h1>
            <p className="text-muted-foreground">Seu controle financeiro</p>
          </div>
          <Badge className="bg-primary text-primary-foreground">Plano Pro</Badge>
        </div>

        {/* Financial summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Pro feature cards */}
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

        {/* Shortcuts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Acesso rápido
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-muted-foreground"
              onClick={() => setEditingShortcuts(!editingShortcuts)}
            >
              {editingShortcuts ? (
                <><Check className="w-3.5 h-3.5" /> Concluído</>
              ) : (
                <><Settings2 className="w-3.5 h-3.5" /> Personalizar</>
              )}
            </Button>
          </div>

          {editingShortcuts ? (
            <div className="space-y-2">
              {orderedShortcuts.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.path} className="flex items-center gap-2 bg-card border rounded-lg px-4 py-3">
                    <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium flex-1">{s.title}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === orderedShortcuts.length - 1}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {orderedShortcuts.map((s) => (
                <ShortcutCard key={s.path} {...s} onClick={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/export')}>CSV</Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/export')}>ICS (Calendário)</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Alertas e Insights avançados</h3>
                  <p className="text-sm text-muted-foreground">Faça upgrade para Premium e tenha automação completa</p>
                </div>
                <Button
                  onClick={() => navigate('/subscribe?plan=premium')}
                  variant="outline"
                  className="hidden sm:flex border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                >
                  Ver planos
                </Button>
              </div>
              <Button
                onClick={() => navigate('/subscribe?plan=premium')}
                variant="outline"
                className="w-full mt-4 sm:hidden border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
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
