import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Wallet, 
  Tag, 
  TrendingDown,
  Calendar,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbExpenses } from '@/hooks/useDbExpenses';
import { ExpenseCategory } from '@/types';

const categoryConfig: Record<ExpenseCategory, { label: string; color: string }> = {
  transport: { label: 'Transporte', color: 'bg-blue-500/10 text-blue-600' },
  food: { label: 'Alimentação', color: 'bg-orange-500/10 text-orange-600' },
  equipment: { label: 'Equipamentos', color: 'bg-purple-500/10 text-purple-600' },
  course: { label: 'Educação', color: 'bg-green-500/10 text-green-600' },
  accountant: { label: 'Contabilidade', color: 'bg-teal-500/10 text-teal-600' },
  uniform: { label: 'Uniforme', color: 'bg-rose-500/10 text-rose-600' },
  other: { label: 'Outros', color: 'bg-muted text-muted-foreground' },
};

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: 'transport', label: 'Transporte' },
  { value: 'food', label: 'Alimentação' },
  { value: 'equipment', label: 'Equipamentos' },
  { value: 'course', label: 'Educação' },
  { value: 'accountant', label: 'Contabilidade' },
  { value: 'uniform', label: 'Uniforme' },
  { value: 'other', label: 'Outros' },
];

export default function ExpensesPage() {
  const { 
    currentMonthExpenses, 
    totalCurrentMonthExpenses, 
    expensesByCategory, 
    isLoading, 
    addExpense, 
    removeExpense 
  } = useDbExpenses();

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSubmit = async () => {
    const numValue = parseFloat(value.replace(',', '.'));
    if (!description.trim() || isNaN(numValue) || numValue <= 0) return;
    
    setIsSaving(true);
    await addExpense({
      description: description.trim(),
      category,
      value: numValue,
      date,
    });
    setIsSaving(false);
    setShowForm(false);
    setDescription('');
    setCategory('other');
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <AppLayout title="Despesas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Despesas">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Despesas</h1>
          <p className="text-sm text-muted-foreground">Controle por categoria</p>
        </div>

        {/* Total card */}
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Total do mês</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totalCurrentMonthExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthExpenses.length} despesa{currentMonthExpenses.length !== 1 ? 's' : ''} registrada{currentMonthExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Categories summary */}
        {expensesByCategory.size > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Por categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(expensesByCategory.entries()).map(([cat, val]) => {
                  const config = categoryConfig[cat] || categoryConfig.other;
                  const percentage = totalCurrentMonthExpenses > 0 
                    ? Math.round((val / totalCurrentMonthExpenses) * 100) 
                    : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <Badge variant="secondary" className={cn("text-xs", config.color)}>
                        {config.label}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(val)}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses list */}
        <div className="space-y-3">
          {currentMonthExpenses.length > 0 && (
            <h3 className="font-medium text-foreground">Últimas despesas</h3>
          )}

          {currentMonthExpenses.map(expense => {
            const config = categoryConfig[expense.category] || categoryConfig.other;
            return (
              <Card key={expense.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{expense.description || 'Sem descrição'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.date + 'T12:00:00'), "dd/MM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-destructive">
                        -{formatCurrency(expense.value)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {currentMonthExpenses.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Nenhuma despesa</CardTitle>
              <CardDescription className="text-center mb-4">
                Registre suas despesas para ter controle financeiro completo
              </CardDescription>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar despesa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add expense modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova despesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Combustível"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="350"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
