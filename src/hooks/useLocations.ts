import { useState, useEffect, useCallback, useMemo } from 'react';
import { Location } from '@/types';
import { getLocations, setLocations, generateId } from '@/lib/storage';

export function useLocations() {
  const [locations, setLocationsState] = useState<Location[]>(() => getLocations());

  useEffect(() => {
    setLocations(locations);
  }, [locations]);

  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    locations.forEach((loc) => map.set(loc.id, loc.name));
    return map;
  }, [locations]);

  const addLocation = useCallback((locationData: Omit<Location, 'id' | 'createdAt'>) => {
    const newLocation: Location = {
      ...locationData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setLocationsState((prev) => [...prev, newLocation]);
    return newLocation;
  }, []);

  const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
    setLocationsState((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
    );
  }, []);

  const removeLocation = useCallback((id: string) => {
    setLocationsState((prev) => prev.filter((loc) => loc.id !== id));
  }, []);

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
    addLocation,
    updateLocation,
    removeLocation,
    getLocationById,
    getLocationDefaults,
  };
}
