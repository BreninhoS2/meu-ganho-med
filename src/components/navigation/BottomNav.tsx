import { NavLink } from 'react-router-dom';
import {
  Home, Calendar, CalendarDays, LayoutDashboard, MoreHorizontal,
  Building2, Receipt, Settings, Wallet, Target, BarChart3, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

interface NavItemDef {
  to: string;
  icon: React.ElementType;
  label: string;
}

// ── Start plan nav ──
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

// ── Pro plan nav ──
const proFixedItems: NavItemDef[] = [
  { to: '/pro', icon: Home, label: 'Início' },
  { to: '/pagamentos', icon: Receipt, label: 'Pagamentos' },
  { to: '/despesas', icon: Wallet, label: 'Despesas' },
  { to: '/metas', icon: Target, label: 'Metas' },
];
const proMenuItems: NavItemDef[] = [
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/calendario', icon: CalendarDays, label: 'Calendário' },
  { to: '/locais', icon: Building2, label: 'Locais' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/export', icon: Download, label: 'Exportar' },
  { to: '/config', icon: Settings, label: 'Config' },
];

// ── Premium plan nav (same as Pro + extras, can be expanded later) ──
const premiumFixedItems: NavItemDef[] = proFixedItems.map(item =>
  item.to === '/pro' ? { ...item, to: '/premium' } : item
);
const premiumMenuItems: NavItemDef[] = proMenuItems;

function getNavItems(plan: string | null): { fixed: NavItemDef[]; menu: NavItemDef[] } {
  switch (plan) {
    case 'pro':
      return { fixed: proFixedItems, menu: proMenuItems };
    case 'premium':
      return { fixed: premiumFixedItems, menu: premiumMenuItems };
    default:
      return { fixed: startFixedItems, menu: startMenuItems };
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

export function BottomNav() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { subscription } = useAuth();

  const { fixed, menu } = getNavItems(subscription.plan);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const menuContent = (
    <div className="flex flex-col gap-1">
      {menu.map((item) => (
        <MenuItemLink key={item.to} {...item} onClick={closeMenu} />
      ))}
    </div>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="container">
        <div className="flex items-center justify-around h-16">
          {fixed.map((item) => (
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
                <SheetContent side="bottom" className="rounded-t-2xl pb-8">
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
              <PopoverContent align="end" side="top" className="w-56 p-2">
                {menuContent}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </nav>
  );
}
