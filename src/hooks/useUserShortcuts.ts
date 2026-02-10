import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_SHORTCUTS = [
  '/agenda', '/calendario', '/locais', '/dashboard',
  '/pagamentos', '/recebimentos', '/despesas', '/metas', '/relatorios',
];

export function useUserShortcuts() {
  const { user } = useAuth();
  const [order, setOrder] = useState<string[]>(DEFAULT_SHORTCUTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_shortcuts')
        .select('shortcut_order')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.shortcut_order && Array.isArray(data.shortcut_order)) {
        // Merge: keep saved order, append any new defaults not yet saved
        const saved = data.shortcut_order as string[];
        const merged = [
          ...saved,
          ...DEFAULT_SHORTCUTS.filter(s => !saved.includes(s)),
        ];
        setOrder(merged);
      }
      setIsLoading(false);
    })();
  }, [user]);

  const saveOrder = useCallback(async (newOrder: string[]) => {
    if (!user) return;
    setOrder(newOrder);
    await supabase
      .from('user_shortcuts')
      .upsert(
        { user_id: user.id, shortcut_order: newOrder as any },
        { onConflict: 'user_id' }
      );
  }, [user]);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    saveOrder(next);
  }, [order, saveOrder]);

  const moveDown = useCallback((index: number) => {
    if (index >= order.length - 1) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    saveOrder(next);
  }, [order, saveOrder]);

  return { order, isLoading, moveUp, moveDown, saveOrder };
}
