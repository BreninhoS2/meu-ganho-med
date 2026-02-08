import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Wallet, 
  Tag, 
  TrendingDown,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data for expenses
const mockExpenses = [
  {
    id: '1',
    description: 'Combustível',
    category: 'transporte',
    value: 350,
    date: new Date(2026, 1, 8),
  },
  {
    id: '2',
    description: 'Material médico',
    category: 'equipamentos',
    value: 280,
    date: new Date(2026, 1, 5),
  },
  {
    id: '3',
    description: 'Refeições plantão',
    category: 'alimentacao',
    value: 120,
    date: new Date(2026, 1, 3),
  },
  {
    id: '4',
    description: 'Estacionamento',
    category: 'transporte',
    value: 80,
    date: new Date(2026, 1, 1),
  },
];

const categoryConfig: Record<string, { label: string; color: string }> = {
  transporte: { label: 'Transporte', color: 'bg-blue-500/10 text-blue-600' },
  alimentacao: { label: 'Alimentação', color: 'bg-orange-500/10 text-orange-600' },
  equipamentos: { label: 'Equipamentos', color: 'bg-purple-500/10 text-purple-600' },
  educacao: { label: 'Educação', color: 'bg-green-500/10 text-green-600' },
  outros: { label: 'Outros', color: 'bg-muted text-muted-foreground' },
};

export default function ExpensesPage() {
  const [expenses] = useState(mockExpenses);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.value;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AppLayout title="Despesas">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Despesas</h1>
            <p className="text-sm text-muted-foreground">
              Controle por categoria
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova despesa
          </Button>
        </div>

        {/* Total card */}
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Total do mês</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} despesas registradas
            </p>
          </CardContent>
        </Card>

        {/* Categories summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Por categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([category, value]) => {
                const config = categoryConfig[category] || categoryConfig.outros;
                const percentage = Math.round((value / totalExpenses) * 100);

                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn("text-xs", config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(value)}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expenses list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Últimas despesas</h3>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>

          {expenses.map(expense => {
            const config = categoryConfig[expense.category] || categoryConfig.outros;

            return (
              <Card key={expense.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{expense.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(expense.date, "dd/MM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-destructive">
                      -{formatCurrency(expense.value)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {expenses.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Nenhuma despesa</CardTitle>
              <CardDescription className="text-center mb-4">
                Registre suas despesas para ter controle financeiro completo
              </CardDescription>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar despesa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
