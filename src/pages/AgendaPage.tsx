import { useState } from 'react';
import { AppLayout } from '@/components/navigation';
import { EventList } from '@/components/agenda/EventList';
import { EventFiltersBar } from '@/components/agenda/EventFiltersBar';
import { EventFormModal } from '@/components/agenda/EventFormModal';
import { AddEventButton } from '@/components/agenda/AddEventButton';
import { ExportButton } from '@/components/agenda/ExportButton';
import { useEvents } from '@/hooks/useEvents';
import { useLocations } from '@/hooks/useLocations';
import { EventFilters, EventType } from '@/types';

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false);
  const [eventTypeToCreate, setEventTypeToCreate] = useState<EventType>('shift');
  const [filters, setFilters] = useState<EventFilters>({});
  
  const { events, currentMonthEvents, addEvent, updateEvent, removeEvent, markAsPaid, filterEvents } = useEvents();
  const { locations, locationMap, getLocationDefaults } = useLocations();

  const filteredEvents = Object.keys(filters).length > 0 
    ? filterEvents(filters) 
    : currentMonthEvents;

  const handleAddEvent = (type: EventType) => {
    setEventTypeToCreate(type);
    setShowForm(true);
  };

  return (
    <AppLayout title="Agenda">
      <div className="space-y-4">
        {/* Filters */}
        <EventFiltersBar 
          filters={filters} 
          onFiltersChange={setFilters}
          locations={locations}
        />

        {/* Events count and export */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
          </span>
          <ExportButton events={filteredEvents} locationMap={locationMap} />
        </div>

        {/* Events List */}
        <EventList 
          events={filteredEvents} 
          locationMap={locationMap}
          onDelete={removeEvent}
          onMarkPaid={markAsPaid}
          onUpdate={updateEvent}
        />
      </div>

      {/* FAB */}
      <AddEventButton onAdd={handleAddEvent} />

      {/* Form Modal */}
      {showForm && (
        <EventFormModal
          type={eventTypeToCreate}
          locations={locations}
          getLocationDefaults={getLocationDefaults}
          onSubmit={(event) => {
            addEvent(event);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </AppLayout>
  );
}
