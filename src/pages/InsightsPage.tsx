import { useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { formatCurrency } from '@/lib/formatters';

export default function InsightsPage() {
  const { events, isLoading } = useDbEvents();

  const insights = useMemo(() => {
    if (!events || events.length === 0) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly trend (last 4 months)
    const monthlyTrend: { month: string; value: number }[] = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthEvents = events.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === m && ed.getFullYear() === y && e.paidAt;
      });
      const total = monthEvents.reduce((s, e) => s + e.netValue, 0);
      monthlyTrend.push({ month: monthNames[m], value: total });
    }

    // Best day of week
    const dayTotals: Record<number, { total: number; count: number }> = {};
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    events.filter(e => e.paidAt).forEach(e => {
      const day = new Date(e.date).getDay();
      if (!dayTotals[day]) dayTotals[day] = { total: 0, count: 0 };
      dayTotals[day].total += e.netValue;
      dayTotals[day].count++;
    });
    const bestDayEntry = Object.entries(dayTotals).sort((a, b) => b[1].total - a[1].total)[0];
    const bestDay = bestDayEntry ? dayNames[Number(bestDayEntry[0])] : '—';

    // Best location
    const locTotals: Record<string, number> = {};
    events.filter(e => e.paidAt && e.locationName).forEach(e => {
      locTotals[e.locationName!] = (locTotals[e.locationName!] || 0) + e.netValue;
    });
    const bestLocation = Object.entries(locTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Average per event
    const paidEvents = events.filter(e => e.paidAt);
    const averagePerEvent = paidEvents.length > 0 ? paidEvents.reduce((s, e) => s + e.netValue, 0) / paidEvents.length : 0;

    // Growth rate
    const curVal = monthlyTrend[3]?.value || 0;
    const prevVal = monthlyTrend[2]?.value || 0;
    const growthRate = prevVal > 0 ? ((curVal - prevVal) / prevVal) * 100 : 0;

    // Projection
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const projectedMonth = dayOfMonth > 0 ? (curVal / dayOfMonth) * daysInMonth : 0;

    return { monthlyTrend, bestDay, bestLocation, averagePerEvent, growthRate, projectedMonth };
  }, [events]);

  if (isLoading) {
    return (
      <AppLayout title="Insights">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!insights || events.length === 0) {
    return (
      <AppLayout title="Insights">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Insights Avançados</h1>
            <p className="text-sm text-muted-foreground">Tendências e análises inteligentes</p>
          </div>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Sem dados suficientes</CardTitle>
              <CardDescription className="text-center">Registre eventos na Agenda para gerar insights.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const maxTrend = Math.max(...insights.monthlyTrend.map(t => t.value), 1);

  const insightCards = [
    { title: 'Melhor dia da semana', value: insights.bestDay, description: 'Dia com maior faturamento', icon: Calendar, color: 'bg-blue-500/10 text-blue-600' },
    { title: 'Local mais rentável', value: insights.bestLocation, description: 'Maior faturamento total', icon: TrendingUp, color: 'bg-green-500/10 text-green-600' },
    { title: 'Média por evento', value: formatCurrency(insights.averagePerEvent), description: 'Considerando eventos pagos', icon: BarChart3, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <AppLayout title="Insights">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Insights Avançados</h1>
          <p className="text-sm text-muted-foreground">Tendências e análises inteligentes</p>
        </div>

        {/* Projection card */}
        <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Projeção do mês</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{formatCurrency(insights.projectedMonth)}</p>
                <p className="text-sm text-muted-foreground mt-1">Baseado na sua média atual</p>
              </div>
              <div className={cn("flex items-center gap-1 text-sm font-medium", insights.growthRate >= 0 ? "text-primary" : "text-destructive")}>
                {insights.growthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(insights.growthRate).toFixed(1)}% vs mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendência de faturamento
            </CardTitle>
            <CardDescription>Últimos 4 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {insights.monthlyTrend.map((trend, index) => {
                const height = maxTrend > 0 ? (trend.value / maxTrend) * 100 : 0;
                const isLast = index === insights.monthlyTrend.length - 1;
                return (
                  <div key={trend.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-24">
                      <span className="text-xs font-medium text-foreground mb-1">
                        {formatCurrency(trend.value).replace('R$', '').trim()}
                      </span>
                      <div className={cn("w-full rounded-t-md transition-all", isLast ? "bg-primary" : "bg-primary/30")} style={{ height: `${Math.max(height, 2)}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{trend.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Insights cards */}
        <div className="space-y-3">
          {insightCards.map((insight) => (
            <Card key={insight.title}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", insight.color)}>
                    <insight.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{insight.title}</p>
                    <p className="text-lg font-semibold text-foreground">{insight.value}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
