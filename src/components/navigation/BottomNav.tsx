import { NavLink } from 'react-router-dom';
import {
  Home, Calendar, CalendarDays, LayoutDashboard, MoreHorizontal,
  Building2, Receipt, Settings, Wallet, Target, BarChart3, Download, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavPrefs } from '@/hooks/useNavPrefs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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
};

// ── Start plan nav (static) ──
const startFixedItems: NavItemDef[] = [
  { to: '/start', icon: Home, label: 'Início' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/pagamentos', icon: Receipt, label: 'Pagamentos' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/locais', icon: Building2, label: 'Locais' },
];
const startMenuItems: NavItemDef[] = [
  { to: '/calendario', icon: CalendarDays, label: 'Calendário' },
  { to: '/config', icon: Settings, label: 'Config' },
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

// Sections for the Pro/Premium menu
const PRO_MENU_SECTION = ['/recebimentos', '/despesas', '/metas', '/relatorios'];
const START_MENU_SECTION = ['/calendario'];
const SYSTEM_MENU_SECTION = ['/config'];

function toNavItem(path: string): NavItemDef | null {
  const meta = NAV_META[path];
  if (!meta) return null;
  return { to: path, icon: meta.icon, label: meta.label };
}

export function BottomNav() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { subscription } = useAuth();
  const plan = subscription.plan;
  const isAdvancedPlan = plan === 'pro' || plan === 'premium' || subscription.isAdmin;

  const navPrefs = useNavPrefs();

  const homePath = getHomePath(isAdvancedPlan ? (plan === 'premium' ? 'premium' : 'pro') : plan);

  // Build nav items based on plan
  let fixedItems: NavItemDef[];

  if (isAdvancedPlan) {
    // Dynamic bar items from user preferences
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
      ...startFixedItems.slice(1), // skip the hardcoded /start
    ];
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openPrefs = useCallback(() => {
    setMenuOpen(false);
    setTimeout(() => setPrefsOpen(true), 200);
  }, []);

  // Build menu content based on plan
  const buildMenuContent = () => {
    if (!isAdvancedPlan) {
      // Start plan: simple menu
      return (
        <div className="flex flex-col gap-1">
          {startMenuItems.map((item) => (
            <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
          ))}
        </div>
      );
    }

    // Pro/Premium: organized sections with items NOT in the bar
    const barPaths = navPrefs.barItems;
    const isInBar = (path: string) => barPaths.includes(path);

    const proItems = PRO_MENU_SECTION.filter(p => !isInBar(p)).map(toNavItem).filter(Boolean) as NavItemDef[];
    const startItems = START_MENU_SECTION.filter(p => !isInBar(p)).map(toNavItem).filter(Boolean) as NavItemDef[];
    const systemItems = SYSTEM_MENU_SECTION.filter(p => !isInBar(p)).map(toNavItem).filter(Boolean) as NavItemDef[];
    // Also include other overflow items not in any section
    const knownPaths = [...PRO_MENU_SECTION, ...START_MENU_SECTION, ...SYSTEM_MENU_SECTION];
    const otherOverflow = navPrefs.menuItems
      .filter(p => !knownPaths.includes(p) && !isInBar(p))
      .map(toNavItem)
      .filter(Boolean) as NavItemDef[];

    return (
      <div className="flex flex-col gap-1">
        {proItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-1">Pro</p>
            {proItems.map((item) => (
              <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
            ))}
          </>
        )}
        {startItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-1">Start</p>
            {startItems.map((item) => (
              <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
            ))}
          </>
        )}
        {otherOverflow.length > 0 && (
          <>
            {otherOverflow.map((item) => (
              <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
            ))}
          </>
        )}
        {systemItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-1">Sistema</p>
            {systemItems.map((item) => (
              <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
            ))}
          </>
        )}
        <div className="border-t border-border my-1" />
        <button
          onClick={openPrefs}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-muted"
        >
          <Settings2 className="w-5 h-5" />
          <span className="text-sm font-medium">Editar barra</span>
        </button>
      </div>
    );
  };

  const menuContent = buildMenuContent();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="container">
          <div className="flex items-center justify-around h-16">
            {fixedItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}

            {/* Menu button */}
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

      {/* Nav prefs modal for Pro/Premium */}
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
