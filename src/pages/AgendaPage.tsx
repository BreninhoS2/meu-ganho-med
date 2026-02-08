import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/navigation';
import { EventList } from '@/components/agenda/EventList';
import { EventCalendar } from '@/components/agenda/EventCalendar';
import { EventFiltersBar } from '@/components/agenda/EventFiltersBar';
import { EventFormModal } from '@/components/agenda/EventFormModal';
import { AddEventButton } from '@/components/agenda/AddEventButton';
import { ExportButton } from '@/components/agenda/ExportButton';
import { FeatureGate, LockedFeatureButton } from '@/components/subscription';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useAuth } from '@/contexts/AuthContext';
import { EventFilters, EventType, MedicalEventWithCalculations } from '@/types';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateEventsCSV, downloadCSV } from '@/lib/csv';
import { generateMonthICS, downloadICS } from '@/lib/ics';
import { getCurrentMonthName } from '@/lib/formatters';

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false);
  const [eventTypeToCreate, setEventTypeToCreate] = useState<EventType>('shift');
  const [editingEvent, setEditingEvent] = useState<MedicalEventWithCalculations | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const { events, currentMonthEvents, isLoading: eventsLoading, addEvent, updateEvent, removeEvent, markAsPaid, filterEvents } = useDbEvents();
  const { locations, locationMap, isLoading: locationsLoading, getLocationDefaults } = useDbLocations();
  const { hasFeature } = useAuth();

  // Apply filters and date selection
  const filteredEvents = useMemo(() => {
    let result = Object.keys(filters).length > 0 
      ? filterEvents(filters) 
      : events;
    
    // If a date is selected, filter to only that date
    if (selectedDate) {
      result = result.filter(event => event.date === selectedDate);
    }
    
    return result;
  }, [filters, selectedDate, filterEvents, events]);

  const handleAddEvent = (type: EventType) => {
    setEventTypeToCreate(type);
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: MedicalEventWithCalculations) => {
    setEditingEvent(event);
    setEventTypeToCreate(event.type);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const isLoading = eventsLoading || locationsLoading;

  if (isLoading) {
    return (
      <AppLayout title="Agenda">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agenda">
      <div className="space-y-4">
        {/* Calendar */}
        <EventCalendar
          events={events}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

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
            {selectedDate && ' no dia selecionado'}
          </span>
          
          {/* Export with gating */}
          {hasFeature('export_csv') || hasFeature('export_ics') ? (
            <ExportButton events={filteredEvents} locationMap={locationMap} />
          ) : (
            <LockedFeatureButton
              featureKey="export_csv"
              featureName="Exportação"
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </LockedFeatureButton>
          )}
        </div>

        {/* Events List */}
        <EventList 
          events={filteredEvents} 
          locationMap={locationMap}
          onDelete={removeEvent}
          onMarkPaid={markAsPaid}
          onUpdate={updateEvent}
          onEdit={handleEditEvent}
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
          editingEvent={editingEvent ?? undefined}
          onSubmit={async (event) => {
            await addEvent(event);
            handleCloseForm();
          }}
          onUpdate={updateEvent}
          onDelete={removeEvent}
          onClose={handleCloseForm}
        />
      )}
    </AppLayout>
  );
}
