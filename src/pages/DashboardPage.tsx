import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  DollarSign, 
  Receipt,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Pencil,
  Building2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useDbGoals } from '@/hooks/useDbGoals';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentMonthEvents, monthlySummary, isLoading: eventsLoading } = useDbEvents();
  const { locations, isLoading: locationsLoading } = useDbLocations();
  const { currentMonthGoal, setGoal, isLoading: goalsLoading } = useDbGoals();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalValue, setGoalValue] = useState('');

  const isLoading = eventsLoading || locationsLoading || goalsLoading;
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  const totalReceived = monthlySummary?.paidAmount ?? 0;
  const totalPending = monthlySummary?.pendingAmount ?? 0;
  const totalEvents = currentMonthEvents?.length ?? 0;
  const monthGoal = currentMonthGoal?.targetAmount ?? 0;
  const goalProgress = monthGoal > 0 ? Math.round((totalReceived / monthGoal) * 100) : 0;

  // Top locations by revenue this month
  const topLocations = (() => {
    const locationRevenue = new Map<string, { name: string; value: number; events: number }>();
    (currentMonthEvents || []).forEach(event => {
      const locName = event.locationName || 'Sem local';
      const existing = locationRevenue.get(locName) || { name: locName, value: 0, events: 0 };
      existing.value += event.netValue;
      existing.events += 1;
      locationRevenue.set(locName, existing);
    });
    return Array.from(locationRevenue.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  })();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSaveGoal = async () => {
    const value = parseFloat(goalValue.replace(',', '.'));
    if (isNaN(value) || value <= 0) return;
    const now = new Date();
    await setGoal(now.getMonth(), now.getFullYear(), value);
    setShowGoalModal(false);
    setGoalValue('');
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        {/* Month header */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base sm:text-lg font-semibold capitalize">{currentMonth}</h2>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Recebido</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-primary">
                {formatCurrency(totalReceived)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Receipt className="w-4 h-4" />
                <span className="text-xs">A receber</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {formatCurrency(totalPending)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalEvents} evento{totalEvents !== 1 ? 's' : ''} no mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goal progress */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Meta do mês
              </CardTitle>
              <div className="flex items-center gap-2">
                {monthGoal > 0 && (
                  <span className="text-xs sm:text-sm font-medium text-primary">{goalProgress}%</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setGoalValue(monthGoal > 0 ? monthGoal.toString() : '');
                    setShowGoalModal(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {monthGoal > 0 ? (
              <>
                <Progress value={goalProgress} className="h-3" />
                <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
                  <span>{formatCurrency(totalReceived)}</span>
                  <span>{formatCurrency(monthGoal)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma meta definida.{' '}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setShowGoalModal(true)}
                >
                  Definir meta
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top locations */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base">Principais locais</CardTitle>
                <CardDescription className="text-xs">Por faturamento no mês</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => navigate('/locais')}
              >
                <Building2 className="w-3.5 h-3.5 mr-1" />
                Gerenciar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topLocations.length > 0 ? (
              <div className="space-y-3">
                {topLocations.map((location, index) => (
                  <div key={location.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {location.events} evento{location.events !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(location.value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum evento com local neste mês
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{totalEvents}</p>
              <p className="text-xs text-muted-foreground">Eventos no mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {totalEvents > 0 ? formatCurrency((totalReceived + totalPending) / totalEvents) : 'R$ 0'}
              </p>
              <p className="text-xs text-muted-foreground">Média por evento</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Definir meta do mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Valor da meta (R$)</Label>
              <Input
                type="number"
                placeholder="Ex: 25000"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowGoalModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveGoal}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
