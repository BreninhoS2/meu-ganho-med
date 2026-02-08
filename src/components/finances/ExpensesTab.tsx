import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense, ExpenseCategory } from '@/types';
import { formatCurrency, formatDate, EXPENSE_CATEGORY_LABELS } from '@/lib/formatters';
import { Plus, Trash2, X, Receipt } from 'lucide-react';

interface ExpensesTabProps {
  expenses: Expense[];
  totalExpenses: number;
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void | Promise<any>;
  onRemove: (id: string) => void | Promise<void>;
}

export function ExpensesTab({ expenses, totalExpenses, onAdd, onRemove }: ExpensesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || parseFloat(value) <= 0) return;

    onAdd({
      category,
      value: parseFloat(value),
      date,
      description: description || undefined,
    });

    // Reset form
    setValue('');
    setDescription('');
    setShowForm(false);
  };

  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Total card */}
      <Card className="p-4 bg-destructive/10 border-destructive/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Despesas do mês</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
          <Receipt className="w-8 h-8 text-destructive" />
        </div>
      </Card>

      {/* Add button or form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar despesa
        </Button>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Nova despesa</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Valor (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="100"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Observação (opcional)</Label>
              <Input
                type="text"
                placeholder="Ex: Mensalidade contador"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!value || parseFloat(value) <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </form>
        </Card>
      )}

      {/* By category */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase">Por categoria</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(expensesByCategory).map(([cat, total]) => (
              <Card key={cat} className="p-3">
                <p className="text-xs text-muted-foreground">{EXPENSE_CATEGORY_LABELS[cat]}</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(total)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Expenses list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase">Histórico</h3>
        
        {expenses.length === 0 ? (
          <Card className="p-6 text-center">
            <Receipt className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa registrada este mês
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                      {expense.description && ` • ${expense.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-destructive">
                      -{formatCurrency(expense.value)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemove(expense.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
