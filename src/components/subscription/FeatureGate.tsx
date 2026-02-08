import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STRIPE_PLANS, PlanType } from '@/lib/stripe';

interface FeatureGateProps {
  children: React.ReactNode;
  featureKey: string;
  fallback?: React.ReactNode;
  showLockIcon?: boolean;
}

export function FeatureGate({
  children,
  featureKey,
  fallback,
  showLockIcon = true,
}: FeatureGateProps) {
  const { hasFeature, getRequiredPlan } = useAuth();

  if (hasFeature(featureKey)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockIcon) {
    return (
      <div className="relative opacity-50 pointer-events-none">
        {children}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return null;
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureKey: string;
  featureName?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureKey,
  featureName,
}: UpgradeModalProps) {
  const navigate = useNavigate();
  const { getRequiredPlan } = useAuth();

  const requiredPlan = getRequiredPlan(featureKey);
  const planInfo = requiredPlan ? STRIPE_PLANS[requiredPlan] : null;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/subscribe');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Recurso exclusivo</DialogTitle>
          <DialogDescription className="text-center">
            {featureName
              ? `"${featureName}" está disponível no plano ${planInfo?.name || 'superior'}.`
              : `Este recurso está disponível no plano ${planInfo?.name || 'superior'}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleUpgrade}>
            Fazer upgrade para {planInfo?.name}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LockedFeatureButtonProps {
  featureKey: string;
  featureName: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LockedFeatureButton({
  featureKey,
  featureName,
  children,
  onClick,
  className,
  variant = 'default',
  size = 'default',
}: LockedFeatureButtonProps) {
  const { hasFeature } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (hasFeature(featureKey)) {
      onClick?.();
    } else {
      navigate('/subscribe');
    }
  };

  const isLocked = !hasFeature(featureKey);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {isLocked && <Lock className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
