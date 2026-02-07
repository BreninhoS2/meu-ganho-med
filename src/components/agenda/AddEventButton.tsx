import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Stethoscope } from 'lucide-react';
import { EventType } from '@/types';

interface AddEventButtonProps {
  onAdd: (type: EventType) => void;
}

export function AddEventButton({ onAdd }: AddEventButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {showOptions && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <Button
            onClick={() => {
              onAdd('consultation');
              setShowOptions(false);
            }}
            className="h-12 px-4 rounded-full shadow-prominent"
            variant="secondary"
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            Consulta
          </Button>
          <Button
            onClick={() => {
              onAdd('shift');
              setShowOptions(false);
            }}
            className="h-12 px-4 rounded-full shadow-prominent"
          >
            <Clock className="w-5 h-5 mr-2" />
            Plantão
          </Button>
        </div>
      )}

      <Button
        onClick={() => setShowOptions(!showOptions)}
        size="lg"
        className="h-14 w-14 rounded-2xl shadow-prominent"
      >
        <Plus className={`w-6 h-6 transition-transform ${showOptions ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
}
