import { MedicalEvent, Shift, Consultation } from '@/types';
import { getEventHours } from './calculations';

function formatICSDate(date: string, time?: string): string {
  const d = new Date(date + 'T' + (time || '08:00') + ':00');
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatICSDateLocal(date: string, time?: string): string {
  const [year, month, day] = date.split('-');
  const [hour, minute] = (time || '08:00').split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

function escapeICS(text: string): string {
  return text.replace(/[,;\\]/g, (match) => '\\' + match).replace(/\n/g, '\\n');
}

export function generateEventICS(event: MedicalEvent, locationName?: string): string {
  const uid = `${event.id}@plantaomed.app`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let summary: string;
  let dtstart: string;
  let dtend: string;
  let description: string;

  if (event.type === 'shift') {
    const shift = event as Shift;
    const hours = getEventHours(shift);
    summary = `Plantão ${shift.duration}${locationName ? ` - ${locationName}` : ''}`;
    
    const startTime = shift.startTime || '07:00';
    dtstart = formatICSDateLocal(event.date, startTime);
    
    // Calculate end time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const endHour = (startHour + hours) % 24;
    const endDate = hours >= 24 - startHour ? 
      addDays(event.date, Math.floor((startHour + hours) / 24)) : 
      event.date;
    dtend = formatICSDateLocal(endDate, `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`);
    
    description = `Valor: R$ ${event.grossValue}`;
  } else {
    const consultation = event as Consultation;
    summary = `Consulta${locationName ? ` - ${locationName}` : ''}`;
    dtstart = formatICSDateLocal(event.date, consultation.time || '08:00');
    
    // Consultations are typically 1 hour
    const [hour, min] = (consultation.time || '08:00').split(':').map(Number);
    dtend = formatICSDateLocal(event.date, `${(hour + 1).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    
    description = consultation.patientName && !consultation.privacyMode 
      ? `Paciente: ${consultation.patientName}`
      : 'Consulta agendada';
  }

  const location = locationName ? `LOCATION:${escapeICS(locationName)}` : '';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlantaoMed//App//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICS(summary)}
DESCRIPTION:${escapeICS(description)}
${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

export function generateMonthICS(events: MedicalEvent[], month: number, year: number, locationMap: Map<string, string>): string {
  const monthEvents = events.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === month && date.getFullYear() === year && e.status !== 'cancelled';
  });

  if (monthEvents.length === 0) {
    return '';
  }

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const vevents = monthEvents.map((event) => {
    const uid = `${event.id}@plantaomed.app`;
    const locationName = event.locationId ? locationMap.get(event.locationId) : undefined;
    
    let summary: string;
    let dtstart: string;
    let dtend: string;
    let description: string;

    if (event.type === 'shift') {
      const shift = event as Shift;
      const hours = getEventHours(shift);
      summary = `Plantão ${shift.duration}${locationName ? ` - ${locationName}` : ''}`;
      
      const startTime = shift.startTime || '07:00';
      dtstart = formatICSDateLocal(event.date, startTime);
      
      const [startHour, startMin] = startTime.split(':').map(Number);
      const endHour = (startHour + hours) % 24;
      const endDate = hours >= 24 - startHour ? 
        addDays(event.date, Math.floor((startHour + hours) / 24)) : 
        event.date;
      dtend = formatICSDateLocal(endDate, `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`);
      
      description = `Valor: R$ ${event.grossValue}`;
    } else {
      const consultation = event as Consultation;
      summary = `Consulta${locationName ? ` - ${locationName}` : ''}`;
      dtstart = formatICSDateLocal(event.date, consultation.time || '08:00');
      
      const [hour, min] = (consultation.time || '08:00').split(':').map(Number);
      dtend = formatICSDateLocal(event.date, `${(hour + 1).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      
      description = consultation.patientName && !consultation.privacyMode 
        ? `Paciente: ${consultation.patientName}`
        : 'Consulta agendada';
    }

    const location = locationName ? `LOCATION:${escapeICS(locationName)}\n` : '';

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICS(summary)}
DESCRIPTION:${escapeICS(description)}
${location}STATUS:CONFIRMED
END:VEVENT`;
  }).join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlantaoMed//App//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vevents}
END:VCALENDAR`;
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
