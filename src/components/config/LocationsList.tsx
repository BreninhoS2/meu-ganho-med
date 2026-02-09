import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Location } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Building2, Trash2, Hospital, Pencil } from 'lucide-react';

interface LocationsListProps {
  locations: Location[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LocationsList({ locations, onEdit, onDelete }: LocationsListProps) {
  if (locations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="font-medium text-foreground mb-1">Nenhum local cadastrado</h3>
        <p className="text-sm text-muted-foreground">
          Adicione hospitais e clínicas para preencher plantões mais rápido
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <Card key={location.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {location.type === 'hospital' ? (
                  <Hospital className="w-5 h-5 text-primary" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{location.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{location.type}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  <span>12h: {formatCurrency(location.defaultShift12hValue)}</span>
                  <span>24h: {formatCurrency(location.defaultShift24hValue)}</span>
                  <span>Consulta: {formatCurrency(location.defaultConsultationValue)}</span>
                </div>
                {location.paymentDeadlineDays > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Pagamento em {location.paymentDeadlineDays} dias
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(location.id)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(location.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
