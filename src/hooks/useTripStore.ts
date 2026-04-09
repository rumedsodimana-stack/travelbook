'use client';

import { useState, useCallback } from 'react';
import { TripItinerary, TripItem } from '@/types/trip';

const STORAGE_KEY = 'travelbook_trips';

function loadTrips(): TripItinerary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistTrips(trips: TripItinerary[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // storage unavailable
  }
}

export function generateBookingRef(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useTrips() {
  const [trips, setTrips] = useState<TripItinerary[]>(() => loadTrips());

  const addTrip = useCallback((trip: TripItinerary) => {
    const updated = [trip, ...loadTrips()];
    persistTrips(updated);
    setTrips(updated);
  }, []);

  const updateItemStatus = useCallback(
    (tripId: string, itemId: string, status: TripItem['status']) => {
      setTrips((prev) => {
        const updated = prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                items: t.items.map((item) =>
                  item.id === itemId ? { ...item, status } : item,
                ),
              }
            : t,
        );
        persistTrips(updated);
        return updated;
      });
    },
    [],
  );

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      persistTrips(updated);
      return updated;
    });
  }, []);

  return { trips, addTrip, updateItemStatus, deleteTrip };
}
