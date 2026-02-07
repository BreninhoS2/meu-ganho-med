import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/navigation';
import { EventList } from '@/components/agenda/EventList';
import { EventCalendar } from '@/components/agenda/EventCalendar';
import { EventFiltersBar } from '@/components/agenda/EventFiltersBar';
import { EventFormModal } from '@/components/agenda/EventFormModal';
import { AddEventButton } from '@/components/agenda/AddEventButton';
import { ExportButton } from '@/components/agenda/ExportButton';
import { useEvents } from '@/hooks/useEvents';
import { useLocations } from '@/hooks/useLocations';
import { EventFilters, EventType, MedicalEventWithCalculations } from '@/types';

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false);
  const [eventTypeToCreate, setEventTypeToCreate] = useState<EventType>('shift');
  const [editingEvent, setEditingEvent] = useState<MedicalEventWithCalculations | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const { events, currentMonthEvents, addEvent, updateEvent, removeEvent, markAsPaid, filterEvents } = useEvents();
  const { locations, locationMap, getLocationDefaults } = useLocations();

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
          <ExportButton events={filteredEvents} locationMap={locationMap} />
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
          onSubmit={(event) => {
            addEvent(event);
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
