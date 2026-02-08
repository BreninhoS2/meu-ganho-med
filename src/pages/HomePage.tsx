import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/navigation';
import { DashboardSummary } from '@/components/home/DashboardSummary';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { QuickInsights } from '@/components/home/QuickInsights';
import { GoalProgress } from '@/components/home/GoalProgress';
import { FeatureGate } from '@/components/subscription';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbGoals } from '@/hooks/useDbGoals';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useDataMigration } from '@/hooks/useDataMigration';
import { useAuth } from '@/contexts/AuthContext';
import { generateInsights } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { checkSubscription, hasFeature, subscription, user } = useAuth();
  const { monthlySummary, upcomingEvents, isLoading: eventsLoading, refetch: refetchEvents } = useDbEvents();
  const { currentMonthGoal, isLoading: goalsLoading } = useDbGoals();
  const { locationMap, isLoading: locationsLoading } = useDbLocations();
  const { migrateData, isMigrating } = useDataMigration();

  // Handle checkout success
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast({
        title: 'Assinatura realizada!',
        description: 'Bem-vindo ao PlantãoMed. Seu plano foi ativado.',
      });
      checkSubscription();
      // Remove query param
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, toast, checkSubscription]);

  // Migrate data on first load
  useEffect(() => {
    migrateData();
  }, [migrateData]);

  const isLoading = eventsLoading || goalsLoading || locationsLoading || isMigrating;

  const insights = generateInsights(
    [],
    monthlySummary,
    currentMonthGoal?.targetAmount
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Show banner if user is logged in but doesn't have an active subscription
  const showSubscriptionBanner = user && !subscription.subscribed;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Subscription Banner */}
        {showSubscriptionBanner && (
          <Alert className="border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Assine para continuar</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-muted-foreground">
                Escolha um plano para desbloquear todas as funcionalidades do PlantãoMed.
              </span>
              <Button asChild size="sm">
                <Link to="/subscribe">Assinar agora</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Summary Card */}
        <DashboardSummary summary={monthlySummary} />
        
        {/* Goal Progress - Pro feature */}
        <FeatureGate featureKey="monthly_goals">
          {currentMonthGoal && (
            <GoalProgress 
              goal={currentMonthGoal.targetAmount} 
              current={monthlySummary.totalNet} 
            />
          )}
        </FeatureGate>
        
        {/* Upcoming Events */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Próximos 7 dias
          </h2>
          <UpcomingEvents events={upcomingEvents} locationMap={locationMap} />
        </section>
        
        {/* Quick Insights */}
        {insights.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Insights
            </h2>
            <QuickInsights insights={insights} />
          </section>
        )}
      </div>
    </AppLayout>
  );
}
