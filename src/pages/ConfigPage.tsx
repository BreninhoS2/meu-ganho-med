import { useState } from 'react';
import { AppLayout } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationsList } from '@/components/config/LocationsList';
import { LocationFormModal } from '@/components/config/LocationFormModal';
import { useLocations } from '@/hooks/useLocations';
import { Building2, Plus, Database, Info } from 'lucide-react';

export default function ConfigPage() {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const { locations, addLocation, updateLocation, removeLocation } = useLocations();

  return (
    <AppLayout title="Configurações">
      <div className="space-y-6">
        {/* Locations section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Locais</h2>
            </div>
            <Button size="sm" onClick={() => setShowLocationForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <LocationsList 
            locations={locations}
            onEdit={(id) => {
              // For now, just allow delete. Edit can be added later.
            }}
            onDelete={removeLocation}
          />
        </section>

        {/* Data section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Dados</h2>
          </div>
          
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground mb-1">
                  Seus dados estão salvos localmente neste dispositivo.
                </p>
                <p className="text-xs text-muted-foreground">
                  Para sincronizar entre dispositivos e fazer backup automático, 
                  habilite o login com conta na próxima versão.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* App info */}
        <section>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">PlantãoMed v1.0</p>
            <p className="text-xs text-muted-foreground mt-1">
              Feito para médicos que querem clareza financeira
            </p>
          </Card>
        </section>
      </div>

      {showLocationForm && (
        <LocationFormModal
          onSubmit={(location) => {
            addLocation(location);
            setShowLocationForm(false);
          }}
          onClose={() => setShowLocationForm(false)}
        />
      )}
    </AppLayout>
  );
}
