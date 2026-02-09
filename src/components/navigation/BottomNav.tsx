import { NavLink } from 'react-router-dom';
import { Home, Calendar, CalendarDays, LayoutDashboard, MoreHorizontal, Building2, Receipt, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
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

const fixedItems = [
  { to: '/start', icon: Home, label: 'Início' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/calendario', icon: CalendarDays, label: 'Calendário' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/locais', icon: Building2, label: 'Locais' },
];

const menuItems = [
  { to: '/pagamentos', icon: Receipt, label: 'Pagamentos' },
  { to: '/config', icon: Settings, label: 'Config' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
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
}

function MenuItemLink({ to, icon: Icon, label, onClick }: { to: string; icon: React.ElementType; label: string; onClick?: () => void }) {
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
}

export function BottomNav() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuContent = (
    <div className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <MenuItemLink key={item.to} {...item} onClick={() => setMenuOpen(false)} />
      ))}
    </div>
  );

  return (
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
