'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Sparkles, Calendar, MapPin, Wand2,
  ChevronLeft, Loader2, Info, Activity, Hotel, Utensils,
  ArrowRight, Clock, Star, Map as MapIcon, Share2, Save,
  CheckCircle2, Trash2, Users, Volume2, MessageSquare, Send, Bot,
  Wallet, PieChart, DollarSign, TrendingUp, ShieldCheck, Plane,
  Database, Globe, Network, Cpu, Lock, PlugZap, ChevronRight, AlertTriangle, ExternalLink, RefreshCw
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
        {
          description: item.description,
          cost: item.estimatedCost,
        },
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

  // Sort by date+time
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

// ─── Component ────────────────────────────────────────────────────────────────

export const TravelPlannerView: React.FC<TravelPlannerViewProps> = ({ onBack, onBookClick, onShareAsPost, onTripSaved }) => {
  const { addTrip } = useTrips();
  const [destination, setDestination] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('Moderate');
  const [duration, setDuration] = useState('3 Days');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [activeMapLocation, setActiveMapLocation] = useState<string | null>(null);
  const [searchPhase, setSearchPhase] = useState('');
  const [tripSaved, setTripSaved] = useState(false);

  const handleGenerate = async () => {
    if (!destination || !interests) return;

    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
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
      const data = await generateItinerary(destination, interests, budget, duration, departureCity);
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
        bio: 'Verified travel partner ready for booking.'
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

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {activeMapLocation && <MapModal location={activeMapLocation} onClose={() => setActiveMapLocation(null)} />}

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        {travelData && (
          <button onClick={() => { setTravelData(null); setError(null); }} className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Start Over</button>
        )}
      </div>

      {!travelData && !loading && (
        <GlassCard className="p-10 border-white/20">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-500/20 rounded-3xl relative">
              <Bot className="text-indigo-400" size={32} />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="text-yellow-400 animate-pulse" size={16} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">AI Trip Planner</h2>
              <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.4em] mt-1">Fast plan, simple inputs, clear results</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-1">From</label>
                <input
                  type="text"
                  placeholder="Starting city"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-1">To</label>
                <input
                  type="text"
                  placeholder="Where to?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-1">Duration</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option className="bg-slate-900">3 Days</option>
                  <option className="bg-slate-900">5 Days</option>
                  <option className="bg-slate-900">1 Week</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-1">Budget</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option className="bg-slate-900">Budget</option>
                  <option className="bg-slate-900">Moderate</option>
                  <option className="bg-slate-900">Luxury</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-1">What Do You Want From This Trip?</label>
              <textarea
                placeholder="Examples: street food, family-friendly activities, beaches, museums, easy transport, romantic stays..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Wand2 size={20} /> Build My Trip
            </button>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                {error}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {loading && (
        <div className="py-20 text-center animate-in fade-in duration-500">
          <div className="relative mx-auto w-24 h-24 mb-10">
            <div className="absolute inset-0 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-purple-500/10 border-t-purple-500 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="text-indigo-400 animate-pulse" size={32} />
            </div>
          </div>
          <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{searchPhase}</p>
        </div>
      )}

      {travelData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <GlassCard className="p-8 border-indigo-500/40 bg-indigo-500/5 flex items-center gap-4">
            <Bot size={24} className="text-indigo-400" />
            <div>
              <p className="text-white font-black text-xs uppercase tracking-widest">Your Trip Plan Is Ready</p>
              <p className="text-white/60 text-xs">Review the budget, book options, or share the plan with others.</p>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-8 border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <Wallet className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl tracking-tight">Projected Cost</h3>
                    <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Estimated total for this trip</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black text-4xl tracking-tighter">${travelData.totalEstimatedBudget}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Accommodation</span>
                  <span className="text-white font-bold">${travelData.budgetBreakdown.accommodation}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Flights</span>
                  <span className="text-white font-bold">${travelData.budgetBreakdown.flights || 0}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Food</span>
                  <span className="text-white font-bold">${travelData.budgetBreakdown.food}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Activities</span>
                  <span className="text-white font-bold">${travelData.budgetBreakdown.activities}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Transport</span>
                  <span className="text-white font-bold">${travelData.budgetBreakdown.transport}</span>
                </div>
              </div>
            </GlassCard>

            {travelData.flights && (
              <GlassCard className="p-8 border-sky-500/30 bg-sky-500/5 group hover:border-sky-400 transition-all cursor-pointer overflow-hidden relative" onClick={() => handleBookItem(travelData.flights, 'Flight')}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <Plane size={80} />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Plane size={24} className="text-sky-400" />
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Suggested Flight</h4>
                  </div>
                  <span className="text-sky-400 font-black text-xl tracking-tighter">${travelData.flights.estimatedPrice}</span>
                </div>
                <div className="mb-6">
                  <p className="text-white font-bold text-lg mb-1">{travelData.flights.airline}</p>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{travelData.flights.duration} · estimated travel time</p>
                </div>
                <button className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
                  Book This Flight <ArrowRight size={14} />
                </button>
              </GlassCard>
            )}
          </div>

          {travelData.days?.map((day, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                  {day.day}
                </div>
                <div>
                  <h4 className="text-white font-black text-xl uppercase tracking-tight">{day.title}</h4>
                  <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Suggested Plan For This Day</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.items?.map((item: any, iIdx: number) => (
                  <GlassCard key={iIdx} className="p-6 border-white/10 hover:border-indigo-500/40 transition-all group overflow-hidden relative">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            {item.category?.includes('Dining') ? <Utensils size={18} /> : <Activity size={18} />}
                          </div>
                          <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">{item.time}</span>
                        </div>
                        <span className="text-emerald-400 font-black text-lg tracking-tighter">${item.estimatedCost}</span>
                      </div>

                      <h5 className="text-white font-black text-lg leading-tight mb-2 group-hover:text-indigo-400 transition-colors">{item.activity}</h5>
                      <p className="text-white/50 text-xs mb-8 leading-relaxed line-clamp-2">{item.description}</p>

                      <div className="mt-auto flex items-center justify-between">
                        <button
                          onClick={() => handleBookItem(item)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl border border-white/10 transition-all"
                        >
                          Book This <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}

          {travelData.sources && travelData.sources.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5 px-2">
              <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Sources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {travelData.sources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                  >
                    <span className="text-white/70 text-xs font-medium truncate max-w-[220px]">{source.title}</span>
                    <ExternalLink size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Book Whole Journey */}
          {tripSaved ? (
            <div className="pt-10 animate-in slide-in-from-bottom-4 duration-500">
              <GlassCard className="p-8 border-teal-500/40 bg-teal-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500/20 rounded-2xl">
                    <CheckCircle2 className="text-teal-400" size={28} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-widest">Trip Saved!</p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Your full itinerary is ready in My Trips — everything is pre-arranged.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onTripSaved}
                  className="flex-shrink-0 px-8 py-4 bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all"
                >
                  View in Trips <ArrowRight size={14} />
                </button>
              </GlassCard>
            </div>
          ) : (
            <div className="pt-10">
              <button
                onClick={handleBookWholeJourney}
                className="w-full py-6 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mb-4"
              >
                <Save size={20} /> Book Whole Journey
              </button>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onShareAsPost?.(`I just planned a ${duration} trip to ${destination} with Travel Book.`, false)}
                  className="flex-1 py-5 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all"
                >
                  <Share2 size={18} /> Share Plan
                </button>
                <button
                  onClick={handleBuddyRequest}
                  className="flex-1 py-5 bg-white/5 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-all"
                >
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
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
