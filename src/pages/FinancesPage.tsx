import { useState } from 'react';
import { AppLayout } from '@/components/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceivablesTab } from '@/components/finances/ReceivablesTab';
import { ExpensesTab } from '@/components/finances/ExpensesTab';
import { ReportsTab } from '@/components/finances/ReportsTab';
import { EventFormModal } from '@/components/agenda/EventFormModal';
import { FeatureGate } from '@/components/subscription';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbExpenses } from '@/hooks/useDbExpenses';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useDbGoals } from '@/hooks/useDbGoals';
import { useAuth } from '@/contexts/AuthContext';
import { MedicalEventWithCalculations } from '@/types';
import { Loader2, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function FinancesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('receivables');
  const [editingEvent, setEditingEvent] = useState<MedicalEventWithCalculations | null>(null);
  
  const { hasFeature } = useAuth();
  const { events, pendingPayments, isLoading: eventsLoading, markAsPaid, updateEvent, removeEvent, addEvent, getMonthlySummary } = useDbEvents();
  const { 
    expenses, 
    currentMonthExpenses, 
    totalCurrentMonthExpenses,
    isLoading: expensesLoading,
    addExpense, 
    removeExpense 
  } = useDbExpenses();
  const { locations, locationMap, isLoading: locationsLoading, getLocationDefaults } = useDbLocations();
  const { currentMonthGoal, setGoal, isLoading: goalsLoading } = useDbGoals();

  const handleEditEvent = (event: MedicalEventWithCalculations) => {
    setEditingEvent(event);
  };

  const handleCloseForm = () => {
    setEditingEvent(null);
  };

  const isLoading = eventsLoading || expensesLoading || locationsLoading || goalsLoading;

  if (isLoading) {
    return (
      <AppLayout title="Finanças">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Locked tab component
  const LockedTabContent = ({ featureName, requiredPlan }: { featureName: string; requiredPlan: string }) => (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Recurso exclusivo</h3>
      <p className="text-muted-foreground mb-4">
        {featureName} está disponível no plano {requiredPlan}.
      </p>
      <Button onClick={() => navigate('/subscribe')}>
        Fazer upgrade
      </Button>
    </Card>
  );

  return (
    <AppLayout title="Finanças">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="receivables">Recebimentos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="mt-0">
          {hasFeature('receivables_smart') ? (
            <ReceivablesTab 
              pendingPayments={pendingPayments}
              locationMap={locationMap}
              onMarkPaid={markAsPaid}
              onEdit={handleEditEvent}
            />
          ) : (
            <LockedTabContent featureName="Recebimentos inteligentes" requiredPlan="Pro" />
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-0">
          {hasFeature('expenses_basic') ? (
            <ExpensesTab 
              expenses={currentMonthExpenses}
              totalExpenses={totalCurrentMonthExpenses}
              onAdd={addExpense}
              onRemove={removeExpense}
            />
          ) : (
            <LockedTabContent featureName="Gestão de despesas" requiredPlan="Pro" />
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          {hasFeature('reports_by_location') ? (
            <ReportsTab 
              events={events}
              expenses={expenses}
              locationMap={locationMap}
              getMonthlySummary={getMonthlySummary}
              currentGoal={currentMonthGoal?.targetAmount}
              setGoal={setGoal}
            />
          ) : (
            <LockedTabContent featureName="Relatórios por local" requiredPlan="Pro" />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventFormModal
          type={editingEvent.type}
          locations={locations}
          getLocationDefaults={getLocationDefaults}
          editingEvent={editingEvent}
          onSubmit={async (event) => {
            await addEvent(event);
            handleCloseForm();
          }}
          onUpdate={updateEvent}
          onDelete={removeEvent}
          onClose={handleCloseForm}
        />
      )}
    </AppLayout>
  );
}
