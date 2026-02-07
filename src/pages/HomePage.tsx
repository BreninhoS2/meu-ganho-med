import { AppLayout } from '@/components/navigation';
import { DashboardSummary } from '@/components/home/DashboardSummary';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { QuickInsights } from '@/components/home/QuickInsights';
import { GoalProgress } from '@/components/home/GoalProgress';
import { useEvents } from '@/hooks/useEvents';
import { useGoals } from '@/hooks/useGoals';
import { useLocations } from '@/hooks/useLocations';
import { generateInsights } from '@/lib/calculations';

export default function HomePage() {
  const { monthlySummary, upcomingEvents } = useEvents();
  const { currentMonthGoal } = useGoals();
  const { locationMap } = useLocations();

  const insights = generateInsights(
    [], // We'll pass events if needed
    monthlySummary,
    currentMonthGoal?.targetAmount
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Main Summary Card */}
        <DashboardSummary summary={monthlySummary} />
        
        {/* Goal Progress */}
        {currentMonthGoal && (
          <GoalProgress 
            goal={currentMonthGoal.targetAmount} 
            current={monthlySummary.totalNet} 
          />
        )}
        
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
