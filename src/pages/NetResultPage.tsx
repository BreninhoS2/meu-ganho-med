import { 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Receipt,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data
const mockResult = {
  grossIncome: 26650,
  totalExpenses: 3200,
  taxes: 2132, // 8% simplified
  netResult: 21318,
  previousMonthNet: 19500,
};

const breakdown = [
  {
    label: 'Receita bruta',
    value: mockResult.grossIncome,
    icon: TrendingUp,
    type: 'income',
  },
  {
    label: 'Despesas operacionais',
    value: -mockResult.totalExpenses,
    icon: Wallet,
    type: 'expense',
  },
  {
    label: 'Impostos estimados (8%)',
    value: -mockResult.taxes,
    icon: Receipt,
    type: 'tax',
  },
];

export default function NetResultPage() {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return value < 0 ? `-${formatted}` : formatted;
  };

  const change = ((mockResult.netResult - mockResult.previousMonthNet) / mockResult.previousMonthNet) * 100;
  const isPositive = change >= 0;

  return (
    <AppLayout title="Resultado Real">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Resultado Líquido Real</h1>
          <p className="text-sm text-muted-foreground">
            Quanto você realmente ganhou este mês
          </p>
        </div>

        {/* Main result card */}
        <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Lucro líquido do mês</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {formatCurrency(mockResult.netResult)}
              </p>
              <div className={cn(
                "flex items-center justify-center gap-1 mt-2 text-sm",
                isPositive ? "text-primary" : "text-destructive"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(change).toFixed(1)}% vs mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Composição do resultado</CardTitle>
            <CardDescription>Detalhamento do cálculo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((item, index) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      item.type === 'income' ? "bg-primary/10 text-primary" :
                      item.type === 'expense' ? "bg-destructive/10 text-destructive" :
                      "bg-amber-500/10 text-amber-600"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    item.value >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
                {index < breakdown.length - 1 && (
                  <div className="border-b border-border/50 mt-3" />
                )}
              </div>
            ))}
            
            <div className="pt-2 border-t-2 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Resultado líquido</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(mockResult.netResult)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-muted">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  O resultado líquido considera sua receita bruta menos despesas operacionais e uma estimativa de impostos. 
                  Para um cálculo preciso, consulte seu contador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
