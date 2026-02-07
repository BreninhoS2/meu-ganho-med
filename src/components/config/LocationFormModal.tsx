import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Location, LocationType } from '@/types';
import { X, Plus } from 'lucide-react';

interface LocationFormModalProps {
  onSubmit: (location: Omit<Location, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function LocationFormModal({ onSubmit, onClose }: LocationFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('hospital');
  const [defaultShift12hValue, setDefaultShift12hValue] = useState('');
  const [defaultShift24hValue, setDefaultShift24hValue] = useState('');
  const [defaultConsultationValue, setDefaultConsultationValue] = useState('');
  const [paymentDeadlineDays, setPaymentDeadlineDays] = useState('30');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      name,
      type,
      defaultShift12hValue: parseFloat(defaultShift12hValue) || 0,
      defaultShift24hValue: parseFloat(defaultShift24hValue) || 0,
      defaultConsultationValue: parseFloat(defaultConsultationValue) || 0,
      paymentDeadlineDays: parseInt(paymentDeadlineDays) || 0,
      notes: notes || undefined,
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-prominent animate-slide-up max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Novo Local</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Nome</Label>
              <Input
                placeholder="Ex: Hospital São Lucas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as LocationType)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clínica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default values */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Valores padrão (R$)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plantão 12h</p>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={defaultShift12hValue}
                    onChange={(e) => setDefaultShift12hValue(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plantão 24h</p>
                  <Input
                    type="number"
                    placeholder="2400"
                    value={defaultShift24hValue}
                    onChange={(e) => setDefaultShift24hValue(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Consulta</p>
                  <Input
                    type="number"
                    placeholder="200"
                    value={defaultConsultationValue}
                    onChange={(e) => setDefaultConsultationValue(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment deadline */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Prazo de pagamento (dias)</Label>
              <Input
                type="number"
                placeholder="30"
                value={paymentDeadlineDays}
                onChange={(e) => setPaymentDeadlineDays(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Observações (opcional)</Label>
              <Textarea
                placeholder="Ex: Pagamento via PIX"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={!isValid} className="w-full h-14 text-base font-semibold rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Local
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
