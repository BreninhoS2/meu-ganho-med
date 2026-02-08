import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoute, getRequiredPlanForRoute } from '@/lib/permissions';
import { PlanType } from '@/lib/stripe';
import { LockedScreen } from '@/components/subscription/LockedScreen';
import { Loader2 } from 'lucide-react';

interface PlanBasedRouteProps {
  children: React.ReactNode;
  routePath: string;
}

export function PlanBasedRoute({ children, routePath }: PlanBasedRouteProps) {
  const { user, subscription, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to subscribe if no active subscription
  if (!subscription.subscribed) {
    return <Navigate to="/subscribe" state={{ from: location }} replace />;
  }

  // Check if user can access this route
  if (!canAccessRoute(subscription.plan, routePath)) {
    const requiredPlan = getRequiredPlanForRoute(routePath);
    return (
      <LockedScreen 
        requiredPlan={requiredPlan as PlanType} 
        currentRoute={routePath}
      />
    );
  }

  return <>{children}</>;
}
