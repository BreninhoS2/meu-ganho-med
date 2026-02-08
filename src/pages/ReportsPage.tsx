import { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  TrendingUp,
  Trophy,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data for reports
const mockLocationData = [
  { name: 'Hospital São Lucas', value: 12400, events: 8, change: 12 },
  { name: 'UPA Centro', value: 8000, events: 5, change: -5 },
  { name: 'Clínica Vida', value: 4050, events: 9, change: 25 },
  { name: 'Hospital Municipal', value: 2400, events: 2, change: 0 },
];

const mockRankingData = [
  { position: 1, name: 'Hospital São Lucas', value: 12400 },
  { position: 2, name: 'UPA Centro', value: 8000 },
  { position: 3, name: 'Clínica Vida', value: 4050 },
  { position: 4, name: 'Hospital Municipal', value: 2400 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('location');

  const totalValue = mockLocationData.reduce((sum, l) => sum + l.value, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getRankBadgeStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-amber-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-700 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout title="Relatórios">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              Análise por local e ranking
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Período
          </Button>
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
                  <span className="text-xs">Total do período</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </p>
              </CardContent>
            </Card>

            {/* Location breakdown */}
            <div className="space-y-3">
              {mockLocationData.map(location => {
                const percentage = Math.round((location.value / totalValue) * 100);

                return (
                  <Card key={location.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{location.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {location.events} eventos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(location.value)}
                          </p>
                          <div className={cn(
                            "flex items-center justify-end gap-1 text-xs",
                            location.change >= 0 ? "text-primary" : "text-destructive"
                          )}>
                            <ArrowUpRight className={cn(
                              "w-3 h-3",
                              location.change < 0 && "rotate-180"
                            )} />
                            <span>{Math.abs(location.change)}%</span>
                          </div>
                        </div>
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
          </TabsContent>

          <TabsContent value="ranking" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Ranking de faturamento
                </CardTitle>
                <CardDescription>
                  Locais com maior receita no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRankingData.map((location) => (
                    <div 
                      key={location.name}
                      className="flex items-center gap-4"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        getRankBadgeStyle(location.position)
                      )}>
                        {location.position}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{location.name}</p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(location.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
