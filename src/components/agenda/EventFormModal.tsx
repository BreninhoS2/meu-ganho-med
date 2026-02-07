import { useState, useEffect } from 'react';
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
import { X, Plus, ChevronDown } from 'lucide-react';
import { EventType, MedicalEvent, Location, Shift, Consultation, ShiftDuration, EventStatus, PaymentStatus } from '@/types';

interface EventFormModalProps {
  type: EventType;
  locations: Location[];
  getLocationDefaults: (locationId: string, type: EventType, duration?: ShiftDuration) => { grossValue: number; paymentDeadlineDays: number } | null;
  onSubmit: (event: Omit<MedicalEvent, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function EventFormModal({ type, locations, getLocationDefaults, onSubmit, onClose }: EventFormModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState<string>('');
  const [grossValue, setGrossValue] = useState('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'value' | 'percentage'>('value');
  const [status, setStatus] = useState<EventStatus>('scheduled');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentDate, setPaymentDate] = useState('');
  
  // Shift specific
  const [duration, setDuration] = useState<ShiftDuration>('12h');
  const [startTime, setStartTime] = useState('07:00');
  
  // Consultation specific
  const [time, setTime] = useState('08:00');
  const [patientName, setPatientName] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);

  // Auto-fill from location
  useEffect(() => {
    if (locationId) {
      const defaults = getLocationDefaults(locationId, type, duration);
      if (defaults) {
        setGrossValue(defaults.grossValue.toString());
        if (defaults.paymentDeadlineDays > 0) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + defaults.paymentDeadlineDays);
          setPaymentDate(futureDate.toISOString().split('T')[0]);
        }
      }
    }
  }, [locationId, duration, type, getLocationDefaults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !grossValue) return;

    const location = locations.find(l => l.id === locationId);
    const baseEvent = {
      date,
      locationId: locationId || undefined,
      locationName: location?.name,
      grossValue: parseFloat(grossValue) || 0,
      discount: parseFloat(discount) || 0,
      discountType,
      status,
      paymentStatus,
      paymentDate: paymentDate || undefined,
    };

    if (type === 'shift') {
      const shift: Omit<Shift, 'id' | 'createdAt'> = {
        ...baseEvent,
        type: 'shift',
        duration,
        startTime,
      };
      onSubmit(shift);
    } else {
      const consultation: Omit<Consultation, 'id' | 'createdAt'> = {
        ...baseEvent,
        type: 'consultation',
        time,
        patientName: patientName || undefined,
        privacyMode,
      };
      onSubmit(consultation);
    }
  };

  const isValid = date && grossValue && parseFloat(grossValue) > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-prominent animate-slide-up max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {type === 'shift' ? 'Novo Plantão' : 'Nova Consulta'}
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-muted-foreground">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Time/Duration row */}
            {type === 'shift' ? (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Duração</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['12h', '24h'] as ShiftDuration[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`h-12 rounded-xl font-medium transition-all ${
                          duration === d
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {d === '12h' ? '12 horas' : '24 horas'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm text-muted-foreground">Início</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm text-muted-foreground">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient" className="text-sm text-muted-foreground">Paciente (opcional)</Label>
                  <Input
                    id="patient"
                    type="text"
                    placeholder="Nome do paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </>
            )}

            {/* Location */}
            {locations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Local</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Gross Value */}
            <div className="space-y-2">
              <Label htmlFor="grossValue" className="text-sm text-muted-foreground">Valor bruto (R$)</Label>
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

            {/* Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Realizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Pagamento</Label>
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment date */}
            {paymentStatus === 'pending' && (
              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-sm text-muted-foreground">
                  Data prevista de pagamento
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}

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
                  <Label className="text-sm text-muted-foreground">Desconto</Label>
                  <div className="flex gap-1">
                    {(['value', 'percentage'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDiscountType(t)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          discountType === t
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {t === 'value' ? 'R$' : '%'}
                      </button>
                    ))}
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
              {type === 'shift' ? 'Adicionar Plantão' : 'Adicionar Consulta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
