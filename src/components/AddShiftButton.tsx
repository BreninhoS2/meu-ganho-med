import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddShiftButtonProps {
  onClick: () => void;
}

export function AddShiftButton({ onClick }: AddShiftButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-prominent z-40"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
