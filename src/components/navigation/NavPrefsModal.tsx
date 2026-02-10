import { memo, useState, useCallback } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import {
  Home, Calendar, CalendarDays, LayoutDashboard, Building2,
  Receipt, Wallet, Target, BarChart3, Download, Settings,
} from 'lucide-react';

const NAV_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/pagamentos': { label: 'Pagamentos', icon: Receipt },
  '/despesas': { label: 'Despesas', icon: Wallet },
  '/metas': { label: 'Metas', icon: Target },
  '/recebimentos': { label: 'Recebimentos', icon: Receipt },
  '/agenda': { label: 'Agenda', icon: Calendar },
  '/calendario': { label: 'Calendário', icon: CalendarDays },
  '/locais': { label: 'Locais', icon: Building2 },
  '/dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  '/relatorios': { label: 'Relatórios', icon: BarChart3 },
  '/export': { label: 'Exportar', icon: Download },
  '/config': { label: 'Config', icon: Settings },
};

interface NavPrefsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleItems: string[];
  allItems: string[];
  maxVisible: number;
  onSave: (items: string[]) => void;
}

export const NavPrefsModal = memo(function NavPrefsModal({
  open, onOpenChange, visibleItems, allItems, maxVisible, onSave,
}: NavPrefsModalProps) {
  const [draft, setDraft] = useState<string[]>(visibleItems);

  // Reset draft when opening
  const handleOpenChange = useCallback((val: boolean) => {
    if (val) setDraft(visibleItems);
    onOpenChange(val);
  }, [visibleItems, onOpenChange]);

  const toggle = useCallback((path: string) => {
    setDraft(prev => {
      if (prev.includes(path)) return prev.filter(p => p !== path);
      if (prev.length >= maxVisible) return prev;
      return [...prev, path];
    });
  }, [maxVisible]);

  const moveUp = useCallback((i: number) => {
    if (i <= 0) return;
    setDraft(prev => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((i: number) => {
    setDraft(prev => {
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave(draft);
    onOpenChange(false);
  }, [draft, onSave, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Personalizar barra inferior</SheetTitle>
        </SheetHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione até {maxVisible} itens para exibir na barra. "Início" é fixo.
        </p>

        {/* Selected items with reorder */}
        <div className="space-y-1 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Na barra</p>
          {draft.map((path, i) => {
            const meta = NAV_META[path];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <div key={path} className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
                <Checkbox checked onCheckedChange={() => toggle(path)} />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{meta.label}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} disabled={i === 0}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === draft.length - 1}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unselected items */}
        <div className="space-y-1 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">No menu</p>
          {allItems.filter(p => !draft.includes(p)).map(path => {
            const meta = NAV_META[path];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <div key={path} className="flex items-center gap-2 bg-muted/30 border rounded-lg px-3 py-2">
                <Checkbox
                  checked={false}
                  disabled={draft.length >= maxVisible}
                  onCheckedChange={() => toggle(path)}
                />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">{meta.label}</span>
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} className="w-full gap-2">
          <Check className="w-4 h-4" /> Salvar
        </Button>
      </SheetContent>
    </Sheet>
  );
});
