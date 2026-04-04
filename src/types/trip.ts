export type TripItemType =
  | 'flight'
  | 'taxi'
  | 'hotel_checkin'
  | 'hotel_checkout'
  | 'event'
  | 'activity'
  | 'transport';

export interface TripItem {
  id: string;
  type: TripItemType;
  title: string;
  description?: string;
  date: string;       // 'YYYY-MM-DD'
  time: string;       // 'HH:MM'
  status: 'upcoming' | 'in_progress' | 'completed';
  bookingRef: string; // 6-char alphanumeric uppercase e.g. 'TK8X2A'
  provider?: string;
  location?: string;
  cost?: number;
  isRide?: boolean;
}

export interface TripItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  items: TripItem[];  // sorted by date+time
  createdAt: string;
}
