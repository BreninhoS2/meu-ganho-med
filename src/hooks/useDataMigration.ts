import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getEvents, getLocations, getExpenses, getGoals } from '@/lib/storage';

export function useDataMigration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);

  const migrateData = useCallback(async () => {
    if (!user) return false;

    // Check if migration has already been done for this user
    const migrationKey = `plantaomed_cloud_migration_${user.id}`;
    if (localStorage.getItem(migrationKey)) {
      return true;
    }

    setIsMigrating(true);

    try {
      // Get local data
      const localEvents = getEvents();
      const localLocations = getLocations();
      const localExpenses = getExpenses();
      const localGoals = getGoals();

      // Migrate locations first (events depend on them)
      if (localLocations.length > 0) {
        const locationsToInsert = localLocations.map((loc) => ({
          user_id: user.id,
          name: loc.name,
          type: loc.type,
          default_shift_12h_value: loc.defaultShift12hValue,
          default_shift_24h_value: loc.defaultShift24hValue,
          default_consultation_value: loc.defaultConsultationValue,
          payment_deadline_days: loc.paymentDeadlineDays,
          notes: loc.notes || null,
        }));

        const { error: locError } = await supabase
          .from('locations')
          .insert(locationsToInsert);

        if (locError) {
          console.error('Error migrating locations:', locError);
        }
      }

      // Migrate events
      if (localEvents.length > 0) {
        const eventsToInsert = localEvents.map((event) => ({
          user_id: user.id,
          type: event.type,
          date: event.date,
          location_id: null, // Can't map old IDs to new ones easily
          location_name: event.locationName || null,
          gross_value: event.grossValue,
          discount: event.discount,
          discount_type: event.discountType,
          status: event.status,
          payment_status: event.paymentStatus,
          payment_date: event.paymentDate || null,
          duration: event.type === 'shift' ? (event as any).duration : null,
          custom_hours: event.type === 'shift' ? (event as any).customHours || null : null,
          start_time: event.type === 'shift' ? (event as any).startTime || null : null,
          end_time: event.type === 'shift' ? (event as any).endTime || null : null,
          time: event.type === 'consultation' ? (event as any).time || null : null,
          patient_name: event.type === 'consultation' ? (event as any).patientName || null : null,
          privacy_mode: event.type === 'consultation' ? (event as any).privacyMode || null : null,
          notes: event.notes || null,
        }));

        const { error: eventError } = await supabase
          .from('events')
          .insert(eventsToInsert);

        if (eventError) {
          console.error('Error migrating events:', eventError);
        }
      }

      // Migrate expenses
      if (localExpenses.length > 0) {
        const expensesToInsert = localExpenses.map((exp) => ({
          user_id: user.id,
          category: exp.category,
          value: exp.value,
          date: exp.date,
          description: exp.description || null,
        }));

        const { error: expError } = await supabase
          .from('expenses')
          .insert(expensesToInsert);

        if (expError) {
          console.error('Error migrating expenses:', expError);
        }
      }

      // Migrate goals
      if (localGoals.length > 0) {
        const goalsToInsert = localGoals.map((goal) => ({
          user_id: user.id,
          month: goal.month,
          year: goal.year,
          target_amount: goal.targetAmount,
        }));

        const { error: goalError } = await supabase
          .from('goals')
          .insert(goalsToInsert);

        if (goalError) {
          console.error('Error migrating goals:', goalError);
        }
      }

      // Mark migration as done
      localStorage.setItem(migrationKey, 'true');

      const totalMigrated = localEvents.length + localLocations.length + localExpenses.length + localGoals.length;
      
      if (totalMigrated > 0) {
        toast({
          title: 'Dados migrados com sucesso!',
          description: `${totalMigrated} registros foram transferidos para a nuvem.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error during migration:', error);
      toast({
        title: 'Erro na migração',
        description: 'Alguns dados podem não ter sido migrados.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsMigrating(false);
    }
  }, [user, toast]);

  return {
    migrateData,
    isMigrating,
  };
}
