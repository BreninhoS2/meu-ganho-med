import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Calendar, CalendarDays, LayoutDashboard, MoreHorizontal,
  Building2, Receipt, Settings, Wallet, Target, BarChart3, Download,
  Bell, TrendingUp, Calculator, FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavPrefs } from '@/hooks/useNavPrefs';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { NavPrefsModal } from './NavPrefsModal';

interface NavItemDef {
  to: string;
  icon: React.ElementType;
  label: string;
}

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
  '/insights': { label: 'Insights', icon: TrendingUp },
  '/resultado-real': { label: 'Resultado Real', icon: Calculator },
  '/alertas-inteligentes': { label: 'Alertas', icon: Bell },
  '/contador': { label: 'Export Contador', icon: FileSpreadsheet },
};

const startFixedItems: NavItemDef[] = [
  { to: '/start', icon: Home, label: 'Início' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/pagamentos', icon: Receipt, label: 'Pagamentos' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/locais', icon: Building2, label: 'Locais' },
];

function getHomePath(plan: string | null): string {
  switch (plan) {
    case 'pro': return '/pro';
    case 'premium': return '/premium';
    default: return '/start';
  }
}

const NavItem = memo(function NavItem({ to, icon: Icon, label }: NavItemDef) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium leading-tight truncate">{label}</span>
    </NavLink>
  );
});

const MenuItemLink = memo(function MenuItemLink({ to, icon: Icon, label, onClick }: NavItemDef & { onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
});

// Menu items by plan tier
const PRO_MENU_ITEMS: NavItemDef[] = [
  { to: '/recebimentos', icon: Receipt, label: 'Recebimentos' },
  { to: '/despesas', icon: Wallet, label: 'Despesas' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

const PREMIUM_MENU_ITEMS: NavItemDef[] = [
  { to: '/insights', icon: TrendingUp, label: 'Insights' },
  { to: '/resultado-real', icon: Calculator, label: 'Resultado Real' },
  { to: '/alertas-inteligentes', icon: Bell, label: 'Alertas' },
  { to: '/contador', icon: FileSpreadsheet, label: 'Export Contador' },
];

const COMMON_MENU_ITEMS: NavItemDef[] = [
  { to: '/calendario', icon: CalendarDays, label: 'Calendário' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { subscription } = useAuth();
  const plan = subscription.plan;
  const isAdvancedPlan = plan === 'pro' || plan === 'premium' || subscription.isAdmin;

  const navPrefs = useNavPrefs();

  const homePath = getHomePath(isAdvancedPlan ? (plan === 'premium' ? 'premium' : 'pro') : plan);

  let fixedItems: NavItemDef[];

  if (isAdvancedPlan) {
    const barPaths = navPrefs.barItems;
    fixedItems = [
      { to: homePath, icon: Home, label: 'Início' },
      ...barPaths
        .filter(p => NAV_META[p])
        .map(p => ({ to: p, icon: NAV_META[p].icon, label: NAV_META[p].label })),
    ];
  } else {
    fixedItems = [
      { to: homePath, icon: Home, label: 'Início' },
      ...startFixedItems.slice(1),
    ];
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openPrefs = useCallback(() => {
    setMenuOpen(false);
    setTimeout(() => setPrefsOpen(true), 200);
  }, []);

  // Build menu items based strictly on subscription.plan
  const menuItems = (() => {
    const items: NavItemDef[] = [];

    // Pro items for pro and premium plans
    if (plan === 'pro' || plan === 'premium' || subscription.isAdmin) {
      items.push(...PRO_MENU_ITEMS);
    }

    // Premium-only items
    if (plan === 'premium' || (subscription.isAdmin && plan !== 'pro')) {
      items.push(...PREMIUM_MENU_ITEMS);
    }

    // Common items always shown
    items.push(...COMMON_MENU_ITEMS);

    return items;
  })();

  const menuContent = (
    <div className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
      ))}
    </div>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="container">
          <div className="flex items-center justify-around h-16">
            {fixedItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}

            {isMobile ? (
              <>
                <button
                  onClick={() => setMenuOpen(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0',
                    menuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MoreHorizontal className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-tight">Menu</span>
                </button>
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[70vh] overflow-y-auto">
                    <SheetHeader className="pb-2">
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    {menuContent}
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0',
                      menuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-tight">Menu</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" side="top" className="w-56 p-2 max-h-[60vh] overflow-y-auto">
                  {menuContent}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </nav>

      {isAdvancedPlan && (
        <NavPrefsModal
          open={prefsOpen}
          onOpenChange={setPrefsOpen}
          visibleItems={navPrefs.visibleItems}
          allItems={navPrefs.allItems}
          maxVisible={navPrefs.maxVisible}
          onSave={navPrefs.savePrefs}
        />
      )}
    </>
  );
}
