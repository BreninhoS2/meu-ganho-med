import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * All possible nav items for Pro/Premium (excluding Início which is always fixed).
 * The order here is the default order.
 */
const ALL_PRO_NAV_ITEMS = [
  '/pagamentos',
  '/despesas',
  '/metas',
  '/recebimentos',
  '/agenda',
  '/calendario',
  '/locais',
  '/dashboard',
  '/relatorios',
  '/export',
  '/config',
];

const DEFAULT_VISIBLE = ['/pagamentos', '/recebimentos', '/despesas', '/metas', '/agenda'];
const MAX_VISIBLE = 5; // besides Início and Menu

export function useNavPrefs() {
  const { user, subscription } = useAuth();
  const [visibleItems, setVisibleItems] = useState<string[]>(DEFAULT_VISIBLE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from('user_nav_prefs')
        .select('visible_items')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.visible_items && Array.isArray(data.visible_items)) {
        setVisibleItems(data.visible_items as string[]);
      }
      setIsLoading(false);
    })();
  }, [user]);

  const savePrefs = useCallback(async (items: string[]) => {
    if (!user) return;
    setVisibleItems(items);
    await (supabase as any)
      .from('user_nav_prefs')
      .upsert(
        { user_id: user.id, visible_items: items },
        { onConflict: 'user_id' }
      );
  }, [user]);

  const allItems = ALL_PRO_NAV_ITEMS;

  // Items shown in bottom bar (up to MAX_VISIBLE)
  const barItems = visibleItems.slice(0, MAX_VISIBLE);

  // Items that go into the "Menu" overflow
  const menuItems = allItems.filter(item => !barItems.includes(item));

  return {
    barItems,
    menuItems,
    visibleItems,
    allItems,
    maxVisible: MAX_VISIBLE,
    isLoading,
    savePrefs,
  };
}
