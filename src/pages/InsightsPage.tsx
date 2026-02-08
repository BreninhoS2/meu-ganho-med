import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock insights data
const mockInsights = {
  monthlyTrend: [
    { month: 'Nov', value: 19200 },
    { month: 'Dez', value: 18500 },
    { month: 'Jan', value: 22000 },
    { month: 'Fev', value: 18450 },
  ],
  projectedMonth: 24000,
  bestDay: 'Sábado',
  bestLocation: 'Hospital São Lucas',
  averagePerEvent: 1537,
  growthRate: 12,
};

const insights = [
  {
    title: 'Melhor dia da semana',
    value: mockInsights.bestDay,
    description: 'Você ganha mais aos sábados',
    icon: Calendar,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Local mais rentável',
    value: mockInsights.bestLocation,
    description: 'Maior faturamento médio',
    icon: TrendingUp,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Média por evento',
    value: `R$ ${mockInsights.averagePerEvent.toLocaleString('pt-BR')}`,
    description: 'Considerando plantões e consultas',
    icon: BarChart3,
    color: 'bg-purple-500/10 text-purple-600',
  },
];

export default function InsightsPage() {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const maxTrend = Math.max(...mockInsights.monthlyTrend.map(t => t.value));

  return (
    <AppLayout title="Insights">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Insights Avançados</h1>
          <p className="text-sm text-muted-foreground">
            Tendências e análises inteligentes
          </p>
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
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(mockInsights.projectedMonth)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Baseado na sua média atual
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                mockInsights.growthRate >= 0 ? "text-primary" : "text-destructive"
              )}>
                {mockInsights.growthRate >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(mockInsights.growthRate)}% vs mês anterior</span>
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
              {mockInsights.monthlyTrend.map((trend, index) => {
                const height = (trend.value / maxTrend) * 100;
                const isLast = index === mockInsights.monthlyTrend.length - 1;

                return (
                  <div key={trend.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-24">
                      <span className="text-xs font-medium text-foreground mb-1">
                        {formatCurrency(trend.value).replace('R$', '').trim()}
                      </span>
                      <div 
                        className={cn(
                          "w-full rounded-t-md transition-all",
                          isLast ? "bg-primary" : "bg-primary/30"
                        )}
                        style={{ height: `${height}%` }}
                      />
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
          {insights.map((insight) => (
            <Card key={insight.title}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    insight.color
                  )}>
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
