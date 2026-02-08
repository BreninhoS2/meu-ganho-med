import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileSpreadsheet, 
  Download,
  Calendar,
  Check,
  FileText,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/navigation/AppLayout';

export default function AccountantExportPage() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [accountantEmail, setAccountantEmail] = useState('');
  const [includeReceipts, setIncludeReceipts] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  const months = [
    { value: '2026-02', label: 'Fevereiro 2026' },
    { value: '2026-01', label: 'Janeiro 2026' },
    { value: '2025-12', label: 'Dezembro 2025' },
  ];

  const handleExport = () => {
    toast({
      title: 'Relatório gerado',
      description: 'O relatório para contador foi baixado com sucesso.',
    });
  };

  const handleSendEmail = () => {
    if (!accountantEmail) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Informe o e-mail do contador para enviar o relatório.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Relatório enviado',
      description: `Relatório enviado para ${accountantEmail}`,
    });
  };

  return (
    <AppLayout title="Export Contador">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Export para Contador</h1>
          <p className="text-sm text-muted-foreground">
            Relatório profissional para contabilidade
          </p>
        </div>

        {/* Period selector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período do relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedPeriod === 'month' && (
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
            )}
          </CardContent>
        </Card>

        {/* Content options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conteúdo do relatório</CardTitle>
            <CardDescription>
              Selecione o que incluir no relatório
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="receipts" 
                checked={includeReceipts}
                onCheckedChange={(checked) => setIncludeReceipts(checked as boolean)}
              />
              <Label htmlFor="receipts" className="flex-1 cursor-pointer">
                <span className="font-medium">Recebimentos</span>
                <p className="text-xs text-muted-foreground">
                  Lista detalhada de todos os recebimentos
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
                  Despesas por categoria
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="summary" 
                checked={includeSummary}
                onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
              />
              <Label htmlFor="summary" className="flex-1 cursor-pointer">
                <span className="font-medium">Resumo financeiro</span>
                <p className="text-xs text-muted-foreground">
                  Totais e indicadores do período
                </p>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Export actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar relatório (PDF)
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou envie por e-mail</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail do contador</Label>
              <Input
                id="email"
                type="email"
                placeholder="contador@email.com"
                value={accountantEmail}
                onChange={(e) => setAccountantEmail(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleSendEmail} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Enviar por e-mail
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">
                  Relatório profissional
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  O relatório é gerado em formato PDF com layout profissional, 
                  pronto para ser utilizado pelo seu contador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
