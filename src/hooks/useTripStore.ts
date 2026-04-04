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
    setTrips((prev) => {
      const updated = [trip, ...prev];
      persistTrips(updated);
      return updated;
    });
  }, []);

  const updateItemStatus = useCallback(
    (tripId: string, itemId: string, status: TripItem['status']) => {
      setTrips((prev) => {
        const updated = prev.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                items: trip.items.map((item) =>
                  item.id === itemId ? { ...item, status } : item,
                ),
              }
            : trip,
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
