import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/navigation/AppLayout';

export default function ExportPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [includeEvents, setIncludeEvents] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includePayments, setIncludePayments] = useState(true);

  const months = [
    { value: '2026-02', label: 'Fevereiro 2026' },
    { value: '2026-01', label: 'Janeiro 2026' },
    { value: '2025-12', label: 'Dezembro 2025' },
    { value: '2025-11', label: 'Novembro 2025' },
  ];

  const handleExportCSV = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'O arquivo CSV será baixado em instantes.',
    });
    // Implementar exportação real
  };

  const handleExportICS = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'O arquivo ICS será baixado em instantes.',
    });
    // Implementar exportação real
  };

  return (
    <AppLayout title="Exportar">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Exportar dados</h1>
          <p className="text-sm text-muted-foreground">
            Exporte seus dados em CSV ou ICS
          </p>
        </div>

        {/* Period selector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Data selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dados a exportar</CardTitle>
            <CardDescription>
              Selecione quais dados deseja incluir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="events" 
                checked={includeEvents}
                onCheckedChange={(checked) => setIncludeEvents(checked as boolean)}
              />
              <Label htmlFor="events" className="flex-1 cursor-pointer">
                <span className="font-medium">Eventos</span>
                <p className="text-xs text-muted-foreground">
                  Plantões e consultas realizados
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="expenses" 
                checked={includeExpenses}
                onCheckedChange={(checked) => setIncludeExpenses(checked as boolean)}
              />
              <Label htmlFor="expenses" className="flex-1 cursor-pointer">
                <span className="font-medium">Despesas</span>
                <p className="text-xs text-muted-foreground">
                  Despesas registradas no período
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="payments" 
                checked={includePayments}
                onCheckedChange={(checked) => setIncludePayments(checked as boolean)}
              />
              <Label htmlFor="payments" className="flex-1 cursor-pointer">
                <span className="font-medium">Pagamentos</span>
                <p className="text-xs text-muted-foreground">
                  Status de recebimentos
                </p>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Export buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={handleExportCSV}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">CSV</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Planilha para Excel
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={handleExportICS}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">ICS</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Calendário (Google, Apple)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground">
                  Seus dados são exportados de forma segura e podem ser importados em qualquer planilha ou calendário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
