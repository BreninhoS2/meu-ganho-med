import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Receipt,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data
const mockData = {
  totalReceived: 18450,
  totalPending: 8200,
  totalEvents: 12,
  monthGoal: 25000,
  lastMonthReceived: 22000,
  topLocations: [
    { name: 'Hospital São Lucas', value: 8400, events: 5 },
    { name: 'UPA Centro', value: 6000, events: 4 },
    { name: 'Clínica Vida', value: 4050, events: 3 },
  ],
};

export default function DashboardPage() {
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const goalProgress = Math.round((mockData.totalReceived / mockData.monthGoal) * 100);
  const monthChange = ((mockData.totalReceived - mockData.lastMonthReceived) / mockData.lastMonthReceived) * 100;
  const isPositiveChange = monthChange >= 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        {/* Month header */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold capitalize">{currentMonth}</h2>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Recebido</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(mockData.totalReceived)}
              </p>
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                isPositiveChange ? "text-primary" : "text-destructive"
              )}>
                {isPositiveChange ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(monthChange).toFixed(1)}% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Receipt className="w-4 h-4" />
                <span className="text-xs">A receber</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(mockData.totalPending)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mockData.totalEvents} eventos no mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goal progress */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Meta do mês
              </CardTitle>
              <span className="text-sm font-medium text-primary">{goalProgress}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={goalProgress} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{formatCurrency(mockData.totalReceived)}</span>
              <span>{formatCurrency(mockData.monthGoal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top locations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Principais locais</CardTitle>
            <CardDescription>Por faturamento no mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.topLocations.map((location, index) => (
                <div key={location.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.events} eventos
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(location.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{mockData.totalEvents}</p>
              <p className="text-xs text-muted-foreground">Eventos realizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(mockData.totalReceived / mockData.totalEvents)}
              </p>
              <p className="text-xs text-muted-foreground">Média por evento</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
