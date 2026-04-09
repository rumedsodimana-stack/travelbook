'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Sparkles, Calendar, MapPin, Wand2,
  ChevronLeft, Loader2, Info, Activity, Hotel, Utensils,
  ArrowRight, Clock, Star, Map as MapIcon, Share2, Save,
  CheckCircle2, Trash2, Users, Volume2, MessageSquare, Send, Bot,
  Wallet, PieChart, DollarSign, TrendingUp, ShieldCheck, Plane,
  Database, Globe, Network, Cpu, Lock, PlugZap, ChevronRight, AlertTriangle, ExternalLink, RefreshCw,
  Car, X, Plus, Minus
} from 'lucide-react';
import { generateItinerary } from '@/services/geminiService';
import { validateInventory } from '@/services/bookingService';
import { MapModal } from '@/components/MapModal';
import { User } from '@/types';
import { useTrips, generateBookingRef } from '@/hooks/useTripStore';
import { TripItinerary, TripItem, TripItemType } from '@/types/trip';

interface TravelPlannerViewProps {
  onBack: () => void;
  onBookClick?: (business: User) => void;
  onShareAsPost?: (content: string, isBuddyRequest: boolean) => void;
  onTripSaved?: () => void;
}

interface TravelData {
  totalEstimatedBudget: number;
  currency: string;
  flights?: {
    airline: string;
    estimatedPrice: number;
    duration: string;
    type: string;
  };
  budgetBreakdown: {
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
    flights?: number;
  };
  days: any[];
  sources?: { title: string, uri: string }[];
}

// ─── Trip conversion helpers ─────────────────────────────────────────────────

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseTime(t: string): string {
  if (!t) return '09:00';
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return '09:00';
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function mapCategory(cat: string): TripItemType {
  const c = (cat || '').toLowerCase();
  if (c.includes('dining') || c.includes('food') || c.includes('restaurant')) return 'activity';
  if (c.includes('transport') || c.includes('bus') || c.includes('train')) return 'transport';
  if (c.includes('taxi') || c.includes('cab') || c.includes('ride')) return 'taxi';
  if (c.includes('hotel') || c.includes('stay') || c.includes('accommodation')) return 'hotel_checkin';
  if (c.includes('event') || c.includes('show') || c.includes('concert') || c.includes('theater')) return 'event';
  return 'activity';
}

function convertToTripItinerary(
  travelData: TravelData,
  destination: string,
  duration: string,
  departureCity: string,
): TripItinerary {
  const numDays = duration.includes('Week') ? 7 : duration.includes('5') ? 5 : 3;
  const startDate = addDays(new Date(), 3);
  const items: TripItem[] = [];

  const makeItem = (
    type: TripItemType,
    title: string,
    date: Date,
    time: string,
    extra: Partial<TripItem> = {},
  ): TripItem => ({
    id: `ti-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    date: formatDateISO(date),
    time,
    status: 'upcoming',
    bookingRef: generateBookingRef(),
    ...extra,
  });

  // Departure taxi
  items.push(makeItem('taxi', `Taxi to ${departureCity || 'Airport'}`, startDate, '07:30', {
    description: 'Driver will be waiting at your door',
    isRide: true,
  }));

  // Outbound flight
  if (travelData.flights) {
    items.push(makeItem('flight', `Flight to ${destination}`, startDate, '10:00', {
      provider: travelData.flights.airline,
      cost: travelData.flights.estimatedPrice,
      description: `Duration: ${travelData.flights.duration}`,
    }));
  }

  // Hotel check-in day 0
  items.push(makeItem('hotel_checkin', `Check in — ${destination}`, startDate, '15:00', {
    description: 'Hotel is expecting your arrival',
    cost: travelData.budgetBreakdown.accommodation,
  }));

  // Activities per day
  (travelData.days || []).forEach((day, dayIdx) => {
    const dayDate = addDays(startDate, dayIdx);
    (day.items || []).forEach((item: any) => {
      items.push(makeItem(
        mapCategory(item.category || ''),
        item.activity || item.name || 'Activity',
        dayDate,
        parseTime(item.time),
        { description: item.description, cost: item.estimatedCost },
      ));
    });
  });

  // Hotel checkout on last day
  const checkoutDate = addDays(startDate, numDays - 1);
  items.push(makeItem('hotel_checkout', `Checkout — ${destination}`, checkoutDate, '11:00', {
    description: 'Checkout by 11:00',
  }));

  // Return taxi from airport
  const returnDate = addDays(startDate, numDays - 1);
  items.push(makeItem('taxi', `Taxi from Airport — Home`, returnDate, '18:00', {
    description: 'Driver will be waiting for you',
    isRide: true,
  }));

  items.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return {
    id: `trip-${Date.now()}`,
    title: `${destination} ${duration} Trip`,
    destination,
    startDate: formatDateISO(startDate),
    endDate: formatDateISO(addDays(startDate, numDays - 1)),
    totalCost: travelData.totalEstimatedBudget,
    status: 'upcoming',
    items,
    createdAt: new Date().toISOString(),
  };
}

// ─── Transport Connector Row ──────────────────────────────────────────────────

interface TransportConnectorProps {
  label?: string;
  duration?: string;
}

const TransportConnector: React.FC<TransportConnectorProps> = ({
  label = '~20 min transfer',
  duration,
}) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 text-xs text-zinc-400 my-1 ml-8">
    <Car size={14} className="text-zinc-500 flex-shrink-0" />
    <span className="flex-1">{duration || label}</span>
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="bg-teal-400/10 border border-teal-400/20 text-teal-400 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:bg-teal-400/20 transition-colors">
        🚗 TravelBook Ride
      </span>
      <span className="bg-white/5 border border-white/10 text-zinc-400 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:bg-white/10 transition-colors">
        🚕 Taxi
      </span>
      <span className="bg-white/5 border border-white/10 text-zinc-400 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:bg-white/10 transition-colors">
        🚌 Transit
      </span>
    </div>
  </div>
);

// ─── Live Budget Bar ──────────────────────────────────────────────────────────

interface BudgetBarProps {
  breakdown: TravelData['budgetBreakdown'];
  total: number;
  travellers: number;
}

const BudgetBar: React.FC<BudgetBarProps> = ({ breakdown, total, travellers }) => {
  const items = [
    { label: 'Accommodation', value: breakdown.accommodation, color: 'bg-teal-400' },
    { label: 'Flights', value: breakdown.flights || 0, color: 'bg-teal-300' },
    { label: 'Food', value: breakdown.food, color: 'bg-amber-400' },
    { label: 'Activities', value: breakdown.activities, color: 'bg-amber-300' },
    { label: 'Transport', value: breakdown.transport, color: 'bg-zinc-400' },
  ];
  const spent = items.reduce((s, i) => s + i.value, 0);
  const pct = Math.min((spent / total) * 100, 100);
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 85 ? 'bg-amber-400' : 'bg-teal-500';

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-teal-400 font-black text-4xl tracking-tighter">${total.toLocaleString()}</p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mt-0.5">
            ${Math.round(total / travellers).toLocaleString()} per person × {travellers} travellers
          </p>
        </div>
        <span className={`text-xs font-bold ${pct >= 100 ? 'text-red-400' : pct >= 85 ? 'text-amber-400' : 'text-teal-400'}`}>
          {Math.round(pct)}% used
        </span>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2 pt-1">
        {items.filter(i => i.value > 0).map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">{item.label}</span>
            </div>
            <span className="text-white font-bold text-sm">${item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const TravelPlannerView: React.FC<TravelPlannerViewProps> = ({ onBack, onBookClick, onShareAsPost, onTripSaved }) => {
  const { addTrip } = useTrips();
  const [destination, setDestination] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('Moderate');
  const [duration, setDuration] = useState('3 Days');
  const [travellers, setTravellers] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [activeMapLocation, setActiveMapLocation] = useState<string | null>(null);
  const [searchPhase, setSearchPhase] = useState('');
  const [tripSaved, setTripSaved] = useState(false);
  const [removedToast, setRemovedToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (removedToast) {
      const t = setTimeout(() => setRemovedToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [removedToast]);

  const runGenerate = async (dest: string, inter: string, budg: string, dur: string, depCity: string) => {
    if (!dest || !inter) return;
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) await (window as any).aistudio.openSelectKey();
    } catch (e) {
      console.warn('AI Studio bridge not available.');
    }
    setLoading(true);
    setError(null);
    setTravelData(null);
    setTripSaved(false);
    setSearchPhase('Building your trip plan...');
    await new Promise(r => setTimeout(r, 700));
    setSearchPhase('Checking flights, stays, and activities...');
    await new Promise(r => setTimeout(r, 900));
    setSearchPhase('Putting the best plan together...');
    try {
      const data = await generateItinerary(dest, inter, budg, dur, depCity);
      if (data) {
        setTravelData(data);
      } else {
        setError('We could not build this trip right now. Please try again.');
      }
    } catch (e: any) {
      console.error(e);
      setError('Something went wrong while building your trip. Please try again.');
    } finally {
      setLoading(false);
      setSearchPhase('');
    }
  };

  const handleGenerate = () => runGenerate(destination, interests, budget, duration, departureCity);

  const handleDemo = () => {
    const demoValues = {
      dep: 'London',
      dest: 'Bali, Indonesia',
      dur: '1 Week',
      budg: 'Moderate',
      inter: 'beaches, temples, local food, sunset dinners, cultural experiences',
    };
    setDepartureCity(demoValues.dep);
    setDestination(demoValues.dest);
    setDuration(demoValues.dur);
    setBudget(demoValues.budg);
    setTravellers(2);
    setInterests(demoValues.inter);
    runGenerate(demoValues.dest, demoValues.inter, demoValues.budg, demoValues.dur, demoValues.dep);
  };

  const handleBookItem = async (item: any, customCategory?: string) => {
    setSearchPhase('Checking availability...');
    const validation = await validateInventory(item.activity || item.airline || item.name);
    setSearchPhase('');
    if (onBookClick && validation.available) {
      const mockBusiness: User = {
        id: `sabre-biz-${Date.now()}`,
        name: item.activity || item.airline || item.name,
        username: '@travel_partner',
        avatar: `https://picsum.photos/seed/${encodeURIComponent(item.activity || item.airline || 'travel')}/200`,
        category: customCategory || item.category || 'Travel Provider',
        isBusiness: true,
        bio: 'Verified travel partner ready for booking.',
      };
      onBookClick(mockBusiness);
    } else {
      setError('That option is not available right now. Please try another one.');
    }
  };

  const handleBookWholeJourney = () => {
    if (!travelData) return;
    const itinerary = convertToTripItinerary(travelData, destination, duration, departureCity);
    addTrip(itinerary);
    setTripSaved(true);
  };

  const handleBuddyRequest = () => {
    if (onShareAsPost && travelData) {
      onShareAsPost(`I just planned a ${duration} trip to ${destination}. Anyone want to join?`, true);
    }
  };

  const removeItem = (dayIdx: number, itemIdx: number) => {
    if (!travelData) return;
    const item = travelData.days[dayIdx].items[itemIdx];
    const cost = item?.estimatedCost || 0;
    const name = item?.activity || item?.name || 'Item';
    setTravelData(prev => {
      if (!prev) return prev;
      const days = prev.days.map((d, dI) => {
        if (dI !== dayIdx) return d;
        return { ...d, items: d.items.filter((_: any, iI: number) => iI !== itemIdx) };
      });
      return {
        ...prev,
        days,
        totalEstimatedBudget: Math.max(0, prev.totalEstimatedBudget - cost),
        budgetBreakdown: {
          ...prev.budgetBreakdown,
          activities: Math.max(0, prev.budgetBreakdown.activities - cost),
        },
      };
    });
    setRemovedToast(`"${name}" removed`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {activeMapLocation && <MapModal location={activeMapLocation} onClose={() => setActiveMapLocation(null)} />}

      {/* Removed toast */}
      {removedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-white/10 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {removedToast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        {travelData && (
          <button onClick={() => { setTravelData(null); setError(null); }} className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">
            Start Over
          </button>
        )}
      </div>

      {/* ── INPUT FORM ── */}
      {!travelData && !loading && (
        <GlassCard className="p-10 border-white/10">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-teal-400/10 rounded-3xl relative">
              <Bot className="text-teal-400" size={32} />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="text-amber-400 animate-pulse" size={16} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">AI Trip Planner</h2>
              <p className="text-zinc-500 text-[9px] uppercase font-black tracking-[0.4em] mt-1">Fast plan, simple inputs, clear results</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* From / To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1">From</label>
                <input type="text" placeholder="Starting city"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1">To</label>
                <input type="text" placeholder="Where to?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>

            {/* Duration / Travellers / Budget */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1">Duration</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option className="bg-zinc-900">3 Days</option>
                  <option className="bg-zinc-900">5 Days</option>
                  <option className="bg-zinc-900">1 Week</option>
                </select>
              </div>

              {/* Travellers stepper */}
              <div className="space-y-2">
                <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Users size={12} /> Travellers
                </label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTravellers(t => Math.max(1, t - 1))}
                    className="px-3 py-3 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-white font-bold text-sm">{travellers}</span>
                  <button
                    type="button"
                    onClick={() => setTravellers(t => Math.min(20, t + 1))}
                    className="px-3 py-3 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1">Budget</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option className="bg-zinc-900">Budget</option>
                  <option className="bg-zinc-900">Moderate</option>
                  <option className="bg-zinc-900">Luxury</option>
                </select>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="text-teal-400 text-xs font-semibold uppercase tracking-widest ml-1">What Do You Want From This Trip?</label>
              <textarea
                placeholder="Examples: street food, family-friendly activities, beaches, museums, easy transport, romantic stays..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none"
                value={interests} onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            {/* Build + Demo buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                className="flex-1 py-5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-2xl uppercase tracking-[0.2em] text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Wand2 size={18} /> Build My Trip
              </button>
              <button
                onClick={handleDemo}
                className="px-6 py-5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={14} className="text-amber-400" /> Try Demo
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                {error}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="py-20 text-center animate-in fade-in duration-500">
          <div className="relative mx-auto w-24 h-24 mb-10">
            <div className="absolute inset-0 border-8 border-teal-500/10 border-t-teal-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-teal-300/10 border-t-teal-300 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="text-teal-400 animate-pulse" size={32} />
            </div>
          </div>
          <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{searchPhase}</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {travelData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">

          {/* Ready banner */}
          <GlassCard className="p-6 border-teal-500/30 bg-teal-400/5 flex items-center gap-4">
            <Bot size={22} className="text-teal-400 flex-shrink-0" />
            <div>
              <p className="text-white font-black text-xs uppercase tracking-widest">Your Trip Plan Is Ready</p>
              <p className="text-zinc-400 text-xs mt-0.5">Review the budget, book options, or share the plan with others.</p>
            </div>
          </GlassCard>

          {/* Budget + Flight row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Budget Card */}
            <GlassCard className="p-8 border-teal-400/20 bg-teal-400/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-400/10 rounded-2xl">
                  <Wallet className="text-teal-400" size={22} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg tracking-tight">Projected Cost</h3>
                  <p className="text-zinc-500 text-[9px] uppercase font-semibold tracking-widest">Estimated total</p>
                </div>
              </div>
              <BudgetBar
                breakdown={travelData.budgetBreakdown}
                total={travelData.totalEstimatedBudget}
                travellers={travellers}
              />
            </GlassCard>

            {/* Flight card */}
            {travelData.flights && (
              <GlassCard className="p-8 border-teal-400/20 bg-teal-400/5 group hover:border-teal-400/40 transition-all cursor-pointer overflow-hidden relative"
                onClick={() => handleBookItem(travelData.flights, 'Flight')}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <Plane size={80} />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Plane size={22} className="text-teal-400" />
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Suggested Flight</h4>
                  </div>
                  <span className="text-teal-400 font-black text-xl tracking-tighter">${travelData.flights.estimatedPrice}</span>
                </div>
                <div className="mb-6">
                  <p className="text-white font-bold text-lg mb-1">{travelData.flights.airline}</p>
                  <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">{travelData.flights.duration} · estimated travel time</p>
                </div>
                <button className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-colors">
                  Book This Flight <ArrowRight size={14} />
                </button>
              </GlassCard>
            )}
          </div>

          {/* ── DAYS — Vertical Timeline ── */}
          {travelData.days?.map((day, dayIdx) => (
            <div key={dayIdx} className="space-y-4">
              {/* Day header */}
              <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {day.day}
                </div>
                <div>
                  <h4 className="text-white font-black text-xl uppercase tracking-tight">{day.title}</h4>
                  <p className="text-zinc-500 text-[10px] uppercase font-semibold tracking-widest">Suggested plan for this day</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8">
                {/* Vertical teal line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-teal-500/30 rounded-full" />

                {/* Airport transfer at start of day 1 */}
                {dayIdx === 0 && (
                  <div className="mb-3">
                    <TransportConnector label="Airport → Hotel Transfer" duration="~40 min" />
                  </div>
                )}

                {(day.items || []).map((item: any, iIdx: number) => (
                  <React.Fragment key={iIdx}>
                    {/* Activity card row */}
                    <div className="flex gap-4 mb-2 items-start">
                      {/* Time pill */}
                      <div className="flex-shrink-0 mt-3">
                        <span className="bg-teal-400/10 border border-teal-400/20 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {item.time || '—'}
                        </span>
                      </div>

                      {/* Card */}
                      <GlassCard className="flex-1 p-5 border-white/10 hover:border-teal-500/30 transition-all group overflow-hidden relative cursor-pointer"
                        onClick={() => handleBookItem(item)}>
                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeItem(dayIdx, iIdx); }}
                          className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                          title="Remove item"
                        >
                          <X size={14} />
                        </button>

                        <div className="flex items-start justify-between mb-2 pr-6">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-teal-400/10 rounded-lg text-teal-400">
                              {item.category?.includes('Dining') ? <Utensils size={14} /> : <Activity size={14} />}
                            </div>
                            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">{item.category || 'Activity'}</span>
                          </div>
                          <span className="text-amber-400 font-black text-base tracking-tighter">${item.estimatedCost}</span>
                        </div>

                        <h5 className="text-white font-black text-base leading-tight mb-1 group-hover:text-teal-400 transition-colors">{item.activity}</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>

                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-400/10 border border-teal-400/20 px-3 py-1.5 rounded-xl">
                            Book This <ChevronRight size={12} />
                          </span>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Transport connector between items (not after last item) */}
                    {iIdx < (day.items.length - 1) && (
                      <TransportConnector />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {/* Sources */}
          {travelData.sources && travelData.sources.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5 px-2">
              <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Sources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {travelData.sources.map((source, sIdx) => (
                  <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <span className="text-zinc-400 text-xs font-medium truncate max-w-[220px]">{source.title}</span>
                    <ExternalLink size={14} className="text-teal-400 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Book Whole Journey / Saved */}
          {tripSaved ? (
            <div className="pt-10 animate-in slide-in-from-bottom-4 duration-500">
              <GlassCard className="p-8 border-teal-500/40 bg-teal-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500/20 rounded-2xl">
                    <CheckCircle2 className="text-teal-400" size={28} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-widest">Trip Saved!</p>
                    <p className="text-zinc-400 text-xs mt-0.5">Your full itinerary is ready in My Trips — everything is pre-arranged.</p>
                  </div>
                </div>
                <button onClick={() => onTripSaved?.()}
                  className="flex-shrink-0 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all">
                  View in Trips <ArrowRight size={14} />
                </button>
              </GlassCard>
            </div>
          ) : (
            <div className="pt-10">
              <button onClick={handleBookWholeJourney}
                className="w-full py-6 bg-gradient-to-r from-teal-500 to-teal-400 text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mb-4">
                <Save size={20} /> Book Whole Journey
              </button>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onShareAsPost?.(`I just planned a ${duration} trip to ${destination} with Travel Book.`, false)}
                  className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 font-semibold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all">
                  <Share2 size={18} /> Share Plan
                </button>
                <button onClick={handleBuddyRequest}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-white/10 transition-all">
                  <Users size={18} /> Find Travel Buddies
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
};
