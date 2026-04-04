'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Booking } from '@/types';
import { TripItinerary, TripItem, TripItemType } from '@/types/trip';
import { useTrips } from '@/hooks/useTripStore';
import {
  Plane, Hotel, Utensils, ShieldCheck, Ticket, Clock,
  CheckCircle2, Car, Hash, Activity, Database,
  Download, QrCode, RefreshCw, AlertTriangle, Settings,
  Smartphone, Trash2, Bus, MapPin, Share2, ChevronLeft,
  Calendar, ArrowRight, Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface BookingsViewProps {
  bookings: Booking[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function fmtShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function fmtRange(start: string, end: string): string {
  return `${fmtShortDate(start)} – ${fmtShortDate(end)}`;
}

function itemTypeLabel(type: TripItemType): string {
  switch (type) {
    case 'flight': return 'Flight';
    case 'taxi': return 'Taxi';
    case 'hotel_checkin': return 'Hotel Check-in';
    case 'hotel_checkout': return 'Hotel Checkout';
    case 'event': return 'Event';
    case 'transport': return 'Transport';
    default: return 'Activity';
  }
}

function itemIcon(type: TripItemType, size = 16) {
  switch (type) {
    case 'flight': return <Plane size={size} className="text-sky-400" />;
    case 'taxi': return <Car size={size} className="text-amber-400" />;
    case 'transport': return <Bus size={size} className="text-purple-400" />;
    case 'hotel_checkin': return <Hotel size={size} className="text-teal-400" />;
    case 'hotel_checkout': return <Hotel size={size} className="text-rose-400" />;
    case 'event': return <Ticket size={size} className="text-rose-400" />;
    default: return <Activity size={size} className="text-indigo-400" />;
  }
}

function itemEmoji(type: TripItemType): string {
  switch (type) {
    case 'flight': return '✈️';
    case 'taxi': return '🚕';
    case 'transport': return '🚌';
    case 'hotel_checkin': return '🏨';
    case 'hotel_checkout': return '🏨';
    case 'event': return '🎭';
    default: return '🎯';
  }
}

function contextMessage(item: TripItem): string {
  switch (item.type) {
    case 'taxi':
    case 'transport': return 'Driver will be waiting for you';
    case 'hotel_checkin': return 'Hotel is expecting your arrival';
    case 'hotel_checkout': return `Checkout by ${item.time}`;
    case 'event': return `Ticket confirmed — Ref: ${item.bookingRef}`;
    case 'flight': return `Boarding at ${item.time} — Gate opens 45 min prior`;
    default: return item.description || 'Confirmed and ready';
  }
}

function statusColors(status: TripItem['status']) {
  switch (status) {
    case 'in_progress': return { chip: 'bg-amber-500/10 border-amber-500/30 text-amber-400', dot: 'bg-amber-400 animate-pulse' };
    case 'completed': return { chip: 'bg-white/5 border-white/10 text-white/30', dot: 'bg-white/30' };
    default: return { chip: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', dot: 'bg-emerald-500' };
  }
}

function statusLabel(status: TripItem['status']) {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Done';
    default: return 'Confirmed';
  }
}

function tripStatusColors(status: TripItinerary['status']) {
  switch (status) {
    case 'in_progress': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'completed': return 'bg-white/5 border-white/10 text-white/30';
    default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  }
}

function tripStatusLabel(status: TripItinerary['status']) {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Past Trip';
    default: return 'Upcoming';
  }
}

// group items by date, preserving sort order
function groupByDate(items: TripItem[]): Array<{ date: string; items: TripItem[] }> {
  const map = new Map<string, TripItem[]>();
  for (const item of items) {
    if (!map.has(item.date)) map.set(item.date, []);
    map.get(item.date)!.push(item);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

// ─── Trip Timeline ───────────────────────────────────────────────────────────

const TripTimeline: React.FC<{ trip: TripItinerary }> = ({ trip }) => {
  const groups = groupByDate(trip.items);
  const nextItemId = trip.items.find((i) => i.status === 'upcoming')?.id;

  return (
    <div className="space-y-6 pb-4">
      {groups.map(({ date, items }) => (
        <div key={date}>
          {/* Date header */}
          <div className="sticky top-0 z-10 py-3 bg-[#07161d]/95 backdrop-blur-xl mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Calendar size={12} className="text-teal-400" />
                <span className="text-white/70 text-[9px] font-black uppercase tracking-widest">
                  {fmtDisplayDate(date)}
                </span>
              </div>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          </div>

          {/* Items */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[17px] top-6 bottom-6 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />

            <div className="space-y-4">
              {items.map((item) => {
                const isNext = item.id === nextItemId;
                const sc = statusColors(item.status);
                return (
                  <div
                    key={item.id}
                    className={`relative flex gap-4 ${isNext ? 'animate-in slide-in-from-left-2 duration-500' : ''}`}
                  >
                    {/* Left dot */}
                    <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                      isNext
                        ? 'bg-teal-500/20 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.4)]'
                        : item.status === 'completed'
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/5 border-white/15'
                    }`}>
                      {itemIcon(item.type, 14)}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 rounded-2xl border p-4 transition-all ${
                      isNext
                        ? 'bg-teal-500/5 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.08)]'
                        : item.status === 'completed'
                          ? 'bg-white/2 border-white/5 opacity-60'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}>
                      {isNext && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                          <span className="text-teal-400 text-[8px] font-black uppercase tracking-[0.3em]">Up Next</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                              {itemTypeLabel(item.type)}
                            </span>
                            {item.provider && (
                              <>
                                <span className="text-white/15">·</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400/60">
                                  {item.provider}
                                </span>
                              </>
                            )}
                          </div>
                          <h5 className={`font-black text-base leading-tight mb-1.5 ${item.status === 'completed' ? 'text-white/40' : 'text-white'}`}>
                            {item.title}
                          </h5>
                          <p className="text-white/40 text-[10px] leading-relaxed">{contextMessage(item)}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {/* Time badge */}
                          <div className="px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg">
                            <span className="text-white font-black text-sm font-mono">{item.time}</span>
                          </div>
                          {/* Status chip */}
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${sc.chip}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className="text-[7px] font-black uppercase tracking-widest">{statusLabel(item.status)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking ref + cost */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Hash size={10} className="text-white/20" />
                          <span className="text-white/25 text-[8px] font-mono uppercase tracking-wider">
                            Ref: {item.bookingRef}
                          </span>
                        </div>
                        {item.cost != null && item.cost > 0 && (
                          <span className="text-white/50 text-[9px] font-black">${item.cost}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Trip Card ───────────────────────────────────────────────────────────────

const TripCard: React.FC<{
  trip: TripItinerary;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ trip, onSelect, onDelete }) => {
  const confirmed = trip.items.length;
  const sc = tripStatusColors(trip.status);

  return (
    <GlassCard className="p-0 overflow-hidden border-white/10 hover:border-white/20 transition-all group cursor-pointer" onClick={onSelect}>
      {/* Hero banner */}
      <div className="relative h-28 bg-gradient-to-br from-teal-900/40 via-indigo-900/30 to-[#07161d] flex items-end p-5">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-teal-500/20 to-indigo-500/10" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg border text-[7px] font-black uppercase tracking-widest ${sc}`}>
            {tripStatusLabel(trip.status)}
          </span>
        </div>
        <div className="relative z-10">
          <h3 className="text-white font-black text-xl tracking-tight leading-tight">{trip.destination}</h3>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-0.5">{trip.title}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-white/40 text-[9px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-teal-400/60" />
            {fmtRange(trip.startDate, trip.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Ticket size={11} className="text-indigo-400/60" />
            {confirmed} items confirmed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg tracking-tighter">${trip.totalCost.toLocaleString()}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <ArrowRight size={16} className="text-white/30 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </GlassCard>
  );
};

// ─── Existing booking card (extracted from original) ─────────────────────────

const LegacyBookingCard: React.FC<{
  booking: Booking;
  isSelected: boolean;
  onSelect: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}> = ({ booking, isSelected, onSelect, showToast }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getIcon = (type: Booking['type']) => {
    switch (type) {
      case 'flight': return <Plane className="text-sky-400" size={24} />;
      case 'hotel': return <Hotel className="text-amber-400" size={24} />;
      case 'restaurant': return <Utensils className="text-emerald-400" size={24} />;
      case 'event': return <Ticket className="text-rose-400" size={24} />;
      default: return <Car className="text-purple-400" size={24} />;
    }
  };

  const handleAddToWallet = () => {
    setIsProcessing('wallet');
    setTimeout(() => {
      setIsProcessing(null);
      showToast(`${booking.title} Pass added to Apple Wallet!`, 'success');
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    setIsProcessing('download');
    setTimeout(() => {
      setIsProcessing(null);
      const el = document.createElement('a');
      const file = new Blob([JSON.stringify(booking, null, 2)], { type: 'text/plain' });
      el.href = URL.createObjectURL(file);
      el.download = `receipt-${booking.id}.txt`;
      document.body.appendChild(el);
      el.click();
      showToast('Receipt downloaded.', 'success');
    }, 1200);
  };

  return (
    <GlassCard
      className={`p-0 overflow-hidden border-white/10 group transition-all duration-500 ${
        isSelected ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'hover:border-white/20'
      }`}
    >
      <div className="flex flex-col">
        <div className="flex">
          <div className="w-20 bg-white/5 p-5 flex flex-col items-center justify-center border-r border-white/5 shrink-0">
            <div className="p-2.5 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
              {getIcon(booking.type)}
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-black text-xl tracking-tight">{booking.title}</h4>
                  <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <span className="text-emerald-400 text-[7px] font-black uppercase tracking-widest">Confirmed</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/40 text-[9px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={10} /> {booking.date}</span>
                  <span className="text-indigo-400">{booking.subtitle}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-black text-2xl tracking-tighter">{booking.price}</p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Ready</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
              <Hash size={11} className="text-indigo-500/40" />
              <span className="text-white/30 font-mono text-[9px]">{booking.id.toUpperCase()}</span>
              <span className="text-white/10 mx-1">·</span>
              <span className="text-white/30 text-[9px]">{booking.details}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-black/30 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onSelect}
              className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                isSelected ? 'bg-white text-slate-950' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white'
              }`}
            >
              <QrCode size={12} /> {isSelected ? 'Hide Pass' : 'Show Pass'}
            </button>
            <button
              onClick={() => showToast(`Refreshing booking ${booking.id.slice(-4)}…`, 'info')}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToWallet}
              className="px-4 py-2 bg-black text-white border border-white/20 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-white hover:text-black transition-all"
            >
              {isProcessing === 'wallet' ? <RefreshCw className="animate-spin" size={12} /> : <Smartphone size={12} />}
              Wallet
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-600/20 transition-all"
            >
              {isProcessing === 'download' ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
            </button>
          </div>
        </div>

        {isSelected && (
          <div className="p-6 border-t border-white/5 bg-black/60 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-8">
              <div className="shrink-0 p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(booking.id + (booking.txHash || ''))}&color=020617`}
                  className="w-24 h-24"
                  alt="Travel pass"
                />
              </div>
              <div>
                <h5 className="text-white font-black text-sm uppercase tracking-wider mb-1">Travel Pass</h5>
                <p className="text-white/40 text-xs mb-3">Show at check-in, gate, or front desk.</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToWallet}
                    className="px-4 py-2 bg-black text-white border border-white/20 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-white hover:text-black transition-all"
                  >
                    <Smartphone size={12} /> Add to Wallet
                  </button>
                  <button
                    onClick={handleDownloadReceipt}
                    className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Download size={12} /> Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

// ─── Main BookingsView ────────────────────────────────────────────────────────

export const BookingsView: React.FC<BookingsViewProps> = ({ bookings }) => {
  const { showToast } = useToast();
  const { trips, deleteTrip } = useTrips();
  const [activeTab, setActiveTab] = useState<'trips' | 'bookings'>('trips');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;

  const filteredBookings =
    bookingFilter === 'all' ? bookings : bookings.filter((b) => b.type === bookingFilter);

  const handleDeleteTrip = (id: string) => {
    deleteTrip(id);
    showToast('Trip removed.', 'info');
    if (selectedTripId === id) setSelectedTripId(null);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-400">
      {/* ── Fixed top section ── */}
      <div className="flex-shrink-0">
        {selectedTrip ? (
          /* Trip detail header */
          <div className="pt-6 pb-4 border-b border-white/5 mb-4">
            <button
              onClick={() => setSelectedTripId(null)}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] group mb-5"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              All Trips
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                  {selectedTrip.destination}
                </h2>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1">
                  {fmtRange(selectedTrip.startDate, selectedTrip.endDate)} · {selectedTrip.items.length} items confirmed
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-white font-black text-2xl tracking-tighter">
                  ${selectedTrip.totalCost.toLocaleString()}
                </span>
                <span className={`px-2 py-0.5 rounded-lg border text-[7px] font-black uppercase tracking-widest ${tripStatusColors(selectedTrip.status)}`}>
                  {tripStatusLabel(selectedTrip.status)}
                </span>
              </div>
            </div>

            {/* Share button */}
            <button className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">
              <Share2 size={12} /> Share Itinerary
            </button>
          </div>
        ) : (
          /* Main header + tabs */
          <>
            <div className="pt-6 pb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">My Trips</h2>
                <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.4em] mt-1">
                  Itineraries, passes, and upcoming plans
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-teal-400 text-[8px] font-black uppercase tracking-widest">
                  {trips.length} saved
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1.5 pb-4 border-b border-white/5">
              {(['trips', 'bookings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 border-white shadow-lg'
                      : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                  }`}
                >
                  {tab === 'trips' ? `Trips ${trips.length > 0 ? `(${trips.length})` : ''}` : 'Bookings'}
                </button>
              ))}

              {activeTab === 'bookings' && (
                <div className="flex items-center gap-1 ml-2">
                  {['all', 'flight', 'hotel', 'restaurant', 'event'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                        bookingFilter === f
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white/5 text-white/30 border-white/10 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'restaurant' ? 'Dining' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-4">
        {/* TRIPS: detail view */}
        {selectedTrip && <TripTimeline trip={selectedTrip} />}

        {/* TRIPS: list view */}
        {!selectedTrip && activeTab === 'trips' && (
          <div className="space-y-4 pt-2">
            {trips.length === 0 ? (
              <GlassCard className="p-16 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center gap-5">
                <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center relative">
                  <MapPin className="text-white/10" size={40} />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-teal-500 rounded-full animate-pulse border-4 border-[#07161d]" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">No Trips Yet</h3>
                  <p className="text-white/30 text-xs max-w-xs mx-auto">
                    Use the AI Trip Planner to build your first itinerary. Everything will appear here, ready to go.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                  <Sparkles size={12} className="text-teal-400" />
                  <span className="text-teal-400 text-[9px] font-black uppercase tracking-widest">Plan a trip → Search → AI Trip Planner</span>
                </div>
              </GlassCard>
            ) : (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={() => setSelectedTripId(trip.id)}
                  onDelete={() => handleDeleteTrip(trip.id)}
                />
              ))
            )}
          </div>
        )}

        {/* BOOKINGS: legacy list */}
        {!selectedTrip && activeTab === 'bookings' && (
          <div className="space-y-4 pt-2">
            {filteredBookings.length === 0 ? (
              <GlassCard className="p-16 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center gap-5">
                <Database className="text-white/10" size={48} />
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">No Bookings Yet</h3>
                  <p className="text-white/30 text-xs max-w-xs mx-auto">
                    Search for stays, flights, or events to start building your trip.
                  </p>
                </div>
              </GlassCard>
            ) : (
              filteredBookings.map((booking) => (
                <LegacyBookingCard
                  key={booking.id}
                  booking={booking}
                  isSelected={selectedBookingId === booking.id}
                  onSelect={() => setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id)}
                  showToast={showToast}
                />
              ))
            )}

            {/* Support banner */}
            <GlassCard className="p-8 border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden mt-4">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <AlertTriangle size={100} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">Need Help?</h3>
                  <p className="text-white/50 text-xs">Changes, cancellations, or questions — we have got you covered.</p>
                </div>
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                  Open Support
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
