import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Location } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbLocation {
  id: string;
  user_id: string;
  name: string;
  type: string;
  default_shift_12h_value: number;
  default_shift_24h_value: number;
  default_consultation_value: number;
  payment_deadline_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToLocation(db: DbLocation): Location {
  return {
    id: db.id,
    name: db.name,
    type: db.type as 'hospital' | 'clinic',
    defaultShift12hValue: Number(db.default_shift_12h_value),
    defaultShift24hValue: Number(db.default_shift_24h_value),
    defaultConsultationValue: Number(db.default_consultation_value),
    paymentDeadlineDays: db.payment_deadline_days,
    notes: db.notes || undefined,
    createdAt: db.created_at,
  };
}

export function useDbLocations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    if (!user) {
      setLocations([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      setLocations((data || []).map(mapDbToLocation));
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Erro ao carregar locais',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    locations.forEach((loc) => map.set(loc.id, loc.name));
    return map;
  }, [locations]);

  const addLocation = useCallback(async (locationData: Omit<Location, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          user_id: user.id,
          name: locationData.name,
          type: locationData.type,
          default_shift_12h_value: locationData.defaultShift12hValue,
          default_shift_24h_value: locationData.defaultShift24hValue,
          default_consultation_value: locationData.defaultConsultationValue,
          payment_deadline_days: locationData.paymentDeadlineDays,
          notes: locationData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newLocation = mapDbToLocation(data);
      setLocations((prev) => [...prev, newLocation]);
      return newLocation;
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Erro ao adicionar local',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const updateLocation = useCallback(async (id: string, updates: Partial<Location>) => {
    if (!user) return;

    try {
      const updateData: Record<string, any> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.defaultShift12hValue !== undefined) updateData.default_shift_12h_value = updates.defaultShift12hValue;
      if (updates.defaultShift24hValue !== undefined) updateData.default_shift_24h_value = updates.defaultShift24hValue;
      if (updates.defaultConsultationValue !== undefined) updateData.default_consultation_value = updates.defaultConsultationValue;
      if (updates.paymentDeadlineDays !== undefined) updateData.payment_deadline_days = updates.paymentDeadlineDays;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
      );
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Erro ao atualizar local',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const removeLocation = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (error) {
      console.error('Error removing location:', error);
      toast({
        title: 'Erro ao remover local',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const getLocationById = useCallback(
    (id: string): Location | undefined => {
      return locations.find((loc) => loc.id === id);
    },
    [locations]
  );

  const getLocationDefaults = useCallback(
    (locationId: string, eventType: 'shift' | 'consultation', duration?: '12h' | '24h') => {
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) return null;

      if (eventType === 'shift') {
        const value = duration === '24h' ? location.defaultShift24hValue : location.defaultShift12hValue;
        return {
          grossValue: value,
          paymentDeadlineDays: location.paymentDeadlineDays,
        };
      } else {
        return {
          grossValue: location.defaultConsultationValue,
          paymentDeadlineDays: location.paymentDeadlineDays,
        };
      }
    },
    [locations]
  );

  return {
    locations,
    locationMap,
    isLoading,
    addLocation,
    updateLocation,
    removeLocation,
    getLocationById,
    getLocationDefaults,
    refetch: fetchLocations,
  };
}
