import { Button } from '@/components/ui/button';
import { Location, EventFilters, EventType, EventStatus, PaymentStatus } from '@/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface EventFiltersBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  locations: Location[];
}

export function EventFiltersBar({ filters, onFiltersChange, locations }: EventFiltersBarProps) {
  const hasFilters = Object.values(filters).some(v => v !== undefined);

  const updateFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K] | undefined) => {
    const newFilters = { ...filters };
    if (value === undefined || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => onFiltersChange({});

  return (
    <div className="flex flex-wrap gap-2">
      {/* Type filter */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value as EventType)}
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="shift">Plantões</SelectItem>
          <SelectItem value="consultation">Consultas</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value as EventStatus)}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="scheduled">Agendado</SelectItem>
          <SelectItem value="completed">Realizado</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment filter */}
      <Select
        value={filters.paymentStatus || 'all'}
        onValueChange={(value) => updateFilter('paymentStatus', value === 'all' ? undefined : value as PaymentStatus)}
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="paid">Pago</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
        </SelectContent>
      </Select>

      {/* Location filter */}
      {locations.length > 0 && (
        <Select
          value={filters.locationId || 'all'}
          onValueChange={(value) => updateFilter('locationId', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Local" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos locais</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
