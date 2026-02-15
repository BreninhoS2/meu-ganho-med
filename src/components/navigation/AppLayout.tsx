import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Stethoscope } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export function AppLayout({ children, title, showHeader = true }: AppLayoutProps) {
  const { pathname } = useLocation();
  const hideBottomNav = pathname === '/config';

  return (
    <div className={`min-h-screen bg-background ${hideBottomNav ? '' : 'pb-20'}`}>
      {showHeader && (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">
                {title || 'PlantãoMed'}
              </span>
            </div>
          </div>
        </header>
      )}
      
      <main className="container py-5">
        {children}
      </main>
      
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
