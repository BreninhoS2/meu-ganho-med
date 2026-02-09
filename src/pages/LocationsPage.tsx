import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/navigation/AppLayout';
import { LocationsList } from '@/components/config/LocationsList';
import { LocationFormModal } from '@/components/config/LocationFormModal';
import { useDbLocations } from '@/hooks/useDbLocations';
import { Loader2 } from 'lucide-react';
import { Location } from '@/types';

export default function LocationsPage() {
  const { locations, isLoading, addLocation, updateLocation, removeLocation, getLocationById } = useDbLocations();
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleEdit = (id: string) => {
    const location = getLocationById(id);
    if (location) {
      setEditingLocation(location);
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLocation(null);
  };

  if (isLoading) {
    return (
      <AppLayout title="Locais">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Locais">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Locais</h1>
            <p className="text-sm text-muted-foreground">
              {locations.length} {locations.length === 1 ? 'local cadastrado' : 'locais cadastrados'}
            </p>
          </div>
          <Button onClick={() => { setEditingLocation(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo local
          </Button>
        </div>

        <LocationsList 
          locations={locations}
          onEdit={handleEdit}
          onDelete={removeLocation}
        />
      </div>

      {showForm && (
        <LocationFormModal
          editingLocation={editingLocation ?? undefined}
          onSubmit={async (locationData) => {
            if (editingLocation) {
              await updateLocation(editingLocation.id, locationData);
            } else {
              await addLocation(locationData);
            }
            handleCloseForm();
          }}
          onClose={handleCloseForm}
        />
      )}
    </AppLayout>
  );
}
