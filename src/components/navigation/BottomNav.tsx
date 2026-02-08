import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, Wallet, Settings, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoute, getPlanHomeRoute } from '@/lib/permissions';

export function BottomNav() {
  const { subscription } = useAuth();
  const navigate = useNavigate();
  const userPlan = subscription.plan;

  // Dynamic nav items based on plan
  const navItems = [
    { 
      to: getPlanHomeRoute(userPlan), 
      icon: Home, 
      label: 'Início',
      requiredPlan: null,
    },
    { 
      to: '/agenda', 
      icon: Calendar, 
      label: 'Agenda',
      requiredPlan: null,
    },
    { 
      to: userPlan === 'start' ? '/pagamentos' : '/despesas', 
      icon: Wallet, 
      label: 'Finanças',
      requiredPlan: userPlan === 'start' ? null : 'pro' as const,
    },
    { 
      to: '/config', 
      icon: Settings, 
      label: 'Config',
      requiredPlan: null,
    },
  ];

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.requiredPlan && !canAccessRoute(userPlan, item.to)) {
      e.preventDefault();
      navigate(item.to); // Will show LockedScreen
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="container">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isLocked = item.requiredPlan && !canAccessRoute(userPlan, item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => handleNavClick(item, e)}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors relative',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                    isLocked && 'opacity-50'
                  )
                }
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {isLocked && (
                    <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
