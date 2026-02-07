import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { MedicalEventWithCalculations } from '@/types';
import { generateEventsCSV, downloadCSV } from '@/lib/csv';
import { generateMonthICS, downloadICS } from '@/lib/ics';
import { getCurrentMonthName } from '@/lib/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  events: MedicalEventWithCalculations[];
  locationMap: Map<string, string>;
}

export function ExportButton({ events, locationMap }: ExportButtonProps) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthName = getCurrentMonthName().replace(' ', '-');

  const handleExportCSV = () => {
    const csv = generateEventsCSV(events, locationMap);
    downloadCSV(csv, `plantaomed-${monthName}.csv`);
  };

  const handleExportICS = () => {
    const ics = generateMonthICS(events, month, year, locationMap);
    if (ics) {
      downloadICS(ics, `plantaomed-${monthName}.ics`);
    }
  };

  if (events.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <Download className="w-4 h-4 mr-1" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportICS}>
          Adicionar ao Calendário (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
