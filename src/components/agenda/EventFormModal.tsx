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
import { X, Plus, ChevronDown, Save, Trash2 } from 'lucide-react';
import { 
  EventType, 
  MedicalEvent, 
  MedicalEventWithCalculations,
  Location, 
  Shift, 
  Consultation, 
  ShiftDuration, 
  EventStatus, 
  PaymentStatus 
} from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EventFormModalProps {
  type: EventType;
  locations: Location[];
  getLocationDefaults: (locationId: string, type: EventType, duration?: ShiftDuration) => { grossValue: number; paymentDeadlineDays: number } | null;
  onSubmit: (event: Omit<MedicalEvent, 'id' | 'createdAt'>) => void | Promise<any>;
  onClose: () => void;
  editingEvent?: MedicalEventWithCalculations;
  onUpdate?: (id: string, updates: Partial<MedicalEvent>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

export function EventFormModal({ 
  type, 
  locations, 
  getLocationDefaults, 
  onSubmit, 
  onClose,
  editingEvent,
  onUpdate,
  onDelete
}: EventFormModalProps) {
  const isEditing = !!editingEvent;
  const eventType = editingEvent?.type || type;
  
  const [date, setDate] = useState(() => editingEvent?.date || new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState<string>(editingEvent?.locationId || '');
  const [grossValue, setGrossValue] = useState(editingEvent?.grossValue?.toString() || '');
  const [showDiscount, setShowDiscount] = useState(editingEvent ? editingEvent.discount > 0 : false);
  const [discount, setDiscount] = useState(editingEvent?.discount?.toString() || '');
  const [discountType, setDiscountType] = useState<'value' | 'percentage'>(editingEvent?.discountType || 'value');
  const [status, setStatus] = useState<EventStatus>(editingEvent?.status || 'scheduled');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(editingEvent?.paymentStatus || 'pending');
  const [paymentDate, setPaymentDate] = useState(editingEvent?.paymentDate || '');
  
  // Shift specific
  const [duration, setDuration] = useState<ShiftDuration>(
    editingEvent?.type === 'shift' ? (editingEvent as Shift).duration : '12h'
  );
  const [startTime, setStartTime] = useState(
    editingEvent?.type === 'shift' ? (editingEvent as Shift).startTime || '07:00' : '07:00'
  );
  
  // Consultation specific
  const [time, setTime] = useState(
    editingEvent?.type === 'consultation' ? (editingEvent as Consultation).time || '08:00' : '08:00'
  );
  const [patientName, setPatientName] = useState(
    editingEvent?.type === 'consultation' ? (editingEvent as Consultation).patientName || '' : ''
  );
  const [privacyMode, setPrivacyMode] = useState(
    editingEvent?.type === 'consultation' ? (editingEvent as Consultation).privacyMode || false : false
  );

  // Auto-fill from location (only for new events)
  useEffect(() => {
    if (locationId && !isEditing) {
      const defaults = getLocationDefaults(locationId, eventType, duration);
      if (defaults) {
        setGrossValue(defaults.grossValue.toString());
        if (defaults.paymentDeadlineDays > 0) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + defaults.paymentDeadlineDays);
          setPaymentDate(futureDate.toISOString().split('T')[0]);
        }
      }
    }
  }, [locationId, duration, eventType, getLocationDefaults, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !grossValue) return;

    const location = locations.find(l => l.id === locationId);
    // Derive paidAt from paymentStatus selection
    const paidAtValue = paymentStatus === 'paid'
      ? (editingEvent?.paidAt || new Date().toISOString())
      : undefined;

    const baseEvent = {
      date,
      locationId: locationId || undefined,
      locationName: location?.name || editingEvent?.locationName,
      grossValue: parseFloat(grossValue) || 0,
      discount: parseFloat(discount) || 0,
      discountType,
      status,
      paymentStatus,
      paymentDate: paymentDate || undefined,
      paidAt: paidAtValue,
    };

    if (isEditing && onUpdate) {
      if (eventType === 'shift') {
        onUpdate(editingEvent.id, {
          ...baseEvent,
          duration,
          startTime,
        });
      } else {
        onUpdate(editingEvent.id, {
          ...baseEvent,
          time,
          patientName: patientName || undefined,
          privacyMode,
        });
      }
      onClose();
      return;
    }

    if (eventType === 'shift') {
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

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      onDelete(editingEvent.id);
      onClose();
    }
  };

  const isValid = date && grossValue && parseFloat(grossValue) > 0;

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal container - centered with max-height */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] max-w-md mx-auto">
        <div className="bg-card rounded-2xl shadow-prominent max-h-[calc(100vh-120px)] flex flex-col animate-slide-up">
          {/* Header - fixed */}
          <div className="p-5 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {isEditing 
                  ? (eventType === 'shift' ? 'Editar Plantão' : 'Editar Consulta')
                  : (eventType === 'shift' ? 'Novo Plantão' : 'Nova Consulta')
                }
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
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
              {eventType === 'shift' ? (
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
                    <SelectContent className="z-[70]">
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
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
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
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
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

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {isEditing && onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-14 px-4 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O evento será permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="flex-1 h-14 text-base font-semibold rounded-xl"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      {eventType === 'shift' ? 'Adicionar Plantão' : 'Adicionar Consulta'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
