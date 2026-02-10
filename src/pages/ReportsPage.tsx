import { useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Trophy,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useState } from 'react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('location');
  const { currentMonthEvents, isLoading: eventsLoading } = useDbEvents();
  const { locations, isLoading: locationsLoading } = useDbLocations();

  const isLoading = eventsLoading || locationsLoading;

  // Build location data from real events
  const locationData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; events: number }>();
    (currentMonthEvents || []).forEach(event => {
      if (event.status === 'cancelled') return;
      const locName = event.locationName || 'Sem local';
      const existing = map.get(locName) || { name: locName, value: 0, events: 0 };
      existing.value += event.netValue;
      existing.events += 1;
      map.set(locName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [currentMonthEvents]);

  const totalValue = locationData.reduce((sum, l) => sum + l.value, 0);

  const rankingData = useMemo(() => {
    return locationData.map((loc, i) => ({ position: i + 1, ...loc }));
  }, [locationData]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getRankBadgeStyle = (position: number) => {
    switch (position) {
      case 1: return 'bg-amber-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-amber-700 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Relatórios">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatórios">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Análise por local e ranking
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="location" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Por local
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="mt-4 space-y-4">
            {/* Total card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">Total do mês</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </p>
              </CardContent>
            </Card>

            {locationData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">Sem dados</CardTitle>
                  <CardDescription className="text-center">
                    Adicione eventos na Agenda para ver relatórios por local
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {locationData.map(location => {
                  const percentage = totalValue > 0 ? Math.round((location.value / totalValue) * 100) : 0;
                  return (
                    <Card key={location.name}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{location.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {location.events} evento{location.events !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(location.value)}
                          </p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {percentage}% do total
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ranking" className="mt-4 space-y-4">
            {rankingData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">Sem dados</CardTitle>
                  <CardDescription className="text-center">
                    Adicione eventos com locais para ver o ranking
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Ranking de faturamento
                  </CardTitle>
                  <CardDescription>
                    Locais com maior receita no mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rankingData.map((location) => (
                      <div key={location.name} className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          getRankBadgeStyle(location.position)
                        )}>
                          {location.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{location.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {location.events} evento{location.events !== 1 ? 's' : ''}
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
