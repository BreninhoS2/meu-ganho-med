import { useState } from 'react';
import { Shift } from '@/types/shift';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, ChevronDown } from 'lucide-react';

interface ShiftFormProps {
  onSubmit: (shift: Omit<Shift, 'id'>) => void;
  onClose: () => void;
}

export function ShiftForm({ onSubmit, onClose }: ShiftFormProps) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [type, setType] = useState<'12h' | '24h'>('12h');
  const [grossValue, setGrossValue] = useState('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'value' | 'percentage'>('value');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !grossValue) return;

    onSubmit({
      date,
      type,
      grossValue: parseFloat(grossValue) || 0,
      discount: parseFloat(discount) || 0,
      discountType,
    });

    // Reset form
    setGrossValue('');
    setDiscount('');
    setShowDiscount(false);
    onClose();
  };

  const isValid = date && grossValue && parseFloat(grossValue) > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-prominent animate-slide-up safe-bottom">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Novo Plantão
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-muted-foreground">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Duração
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('12h')}
                  className={`h-12 rounded-xl font-medium transition-all ${
                    type === '12h'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  12 horas
                </button>
                <button
                  type="button"
                  onClick={() => setType('24h')}
                  className={`h-12 rounded-xl font-medium transition-all ${
                    type === '24h'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  24 horas
                </button>
              </div>
            </div>

            {/* Gross Value */}
            <div className="space-y-2">
              <Label htmlFor="grossValue" className="text-sm text-muted-foreground">
                Valor bruto (R$)
              </Label>
              <Input
                id="grossValue"
                type="number"
                inputMode="decimal"
                placeholder="1.500"
                value={grossValue}
                onChange={(e) => setGrossValue(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Optional Discount Toggle */}
            {!showDiscount ? (
              <button
                type="button"
                onClick={() => setShowDiscount(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Adicionar desconto (opcional)
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Desconto
                  </Label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDiscountType('value')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        discountType === 'value'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        discountType === 'percentage'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={discountType === 'value' ? '150' : '10'}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-14 text-base font-semibold rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Plantão
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
