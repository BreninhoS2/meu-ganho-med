import { useState } from 'react';
import { AppLayout } from '@/components/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceivablesTab } from '@/components/finances/ReceivablesTab';
import { ExpensesTab } from '@/components/finances/ExpensesTab';
import { ReportsTab } from '@/components/finances/ReportsTab';
import { useEvents } from '@/hooks/useEvents';
import { useExpenses } from '@/hooks/useExpenses';
import { useLocations } from '@/hooks/useLocations';
import { useGoals } from '@/hooks/useGoals';

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('receivables');
  
  const { events, pendingPayments, markAsPaid, getMonthlySummary } = useEvents();
  const { 
    expenses, 
    currentMonthExpenses, 
    totalCurrentMonthExpenses, 
    addExpense, 
    removeExpense 
  } = useExpenses();
  const { locations, locationMap } = useLocations();
  const { currentMonthGoal, setGoal, calculateProgress } = useGoals();

  return (
    <AppLayout title="Finanças">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="receivables">Recebimentos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="mt-0">
          <ReceivablesTab 
            pendingPayments={pendingPayments}
            locationMap={locationMap}
            onMarkPaid={markAsPaid}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-0">
          <ExpensesTab 
            expenses={currentMonthExpenses}
            totalExpenses={totalCurrentMonthExpenses}
            onAdd={addExpense}
            onRemove={removeExpense}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <ReportsTab 
            events={events}
            expenses={expenses}
            locationMap={locationMap}
            getMonthlySummary={getMonthlySummary}
            currentGoal={currentMonthGoal?.targetAmount}
            setGoal={setGoal}
            calculateProgress={calculateProgress}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
