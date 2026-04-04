'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Booking } from '@/types';
import {
  Plane, Hotel, Utensils, ShieldCheck, ExternalLink, Ticket, Clock,
  CheckCircle2, Bus, Train, Car, Hash, Activity, Lock, Database,
  ArrowUpRight, Filter, Search, Globe, ChevronDown, Download,
  QrCode, RefreshCw, AlertTriangle, Settings, MessageSquare, Trash2,
  Smartphone, FileText, Share2
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface BookingsViewProps {
  bookings: Booking[];
}

export const BookingsView: React.FC<BookingsViewProps> = ({ bookings }) => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.type === filter);

  const getIcon = (type: Booking['type']) => {
    switch(type) {
      case 'flight': return <Plane className="text-sky-400" size={24} />;
      case 'hotel': return <Hotel className="text-amber-400" size={24} />;
      case 'restaurant': return <Utensils className="text-emerald-400" size={24} />;
      case 'event': return <Ticket className="text-rose-400" size={24} />;
      default: return <Car className="text-purple-400" size={24} />;
    }
  };

  const getFilterLabel = (value: string) => {
    switch (value) {
      case 'flight':
        return 'Flights';
      case 'hotel':
        return 'Hotels';
      case 'restaurant':
        return 'Dining';
      case 'event':
        return 'Events';
      default:
        return 'All';
    }
  };

  const handleSyncNode = (id: string) => {
    showToast(`Checking the latest status for booking ${id.slice(-4)}...`, 'info');
    setTimeout(() => {
      showToast('Booking status refreshed.', 'success');
    }, 1500);
  };

  const handleAddToWallet = (booking: Booking) => {
    setIsProcessing(`wallet-${booking.id}`);
    setTimeout(() => {
      setIsProcessing(null);
      showToast(`${booking.title} Pass added to Apple Wallet!`, 'success');
    }, 1500);
  };

  const handleDownloadReceipt = (booking: Booking) => {
    setIsProcessing(`download-${booking.id}`);
    setTimeout(() => {
      setIsProcessing(null);
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(booking, null, 2)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `receipt-${booking.id}.txt`;
      document.body.appendChild(element);
      element.click();
      showToast('Receipt downloaded.', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">My Bookings</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-white/40 text-[9px] uppercase font-black tracking-[0.4em]">Upcoming plans, passes, and receipts</p>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Ready To Use</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"><Settings size={20} /></button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-indigo-500/20">Refresh All</button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5 px-2">
        {['all', 'flight', 'hotel', 'restaurant', 'event'].map(item => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`whitespace-nowrap px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
              filter === item ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
          >
            {getFilterLabel(item)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <GlassCard className="p-24 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-[3rem] flex items-center justify-center relative">
              <Database className="text-white/10" size={48} />
              <div className="absolute top-0 right-0 w-4 h-4 bg-amber-500 rounded-full animate-pulse border-4 border-[#020617]" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">No Bookings Yet</h3>
              <p className="text-white/30 text-xs max-w-xs mx-auto">Search for stays, flights, or events to start building your trip.</p>
            </div>
            <button className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[9px]">Start Exploring</button>
          </GlassCard>
        ) : (
          filteredBookings.map((booking, idx) => (
            <GlassCard
              key={booking.id}
              className={`p-0 overflow-hidden border-white/10 group animate-in slide-in-from-bottom-4 transition-all duration-500 ${selectedBookingId === booking.id ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'hover:border-white/20'}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-24 bg-white/5 p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-white/5 shrink-0">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                      {getIcon(booking.type)}
                    </div>
                    <div className="mt-4 hidden lg:block">
                      <p className="text-[8px] font-black text-white/20 uppercase vertical-text tracking-[0.5em]">{booking.type}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-black text-3xl tracking-tighter uppercase">{booking.title}</h4>
                          <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Confirmed</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> Date: {booking.date}</span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-indigo-400">{booking.subtitle}</span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="flex items-center gap-1.5"><Globe size={12} /> Provider: {booking.gdsNode || 'Travel Book'}</span>
                        </div>
                      </div>
                      <div className="text-left md:text-right shrink-0">
                        <p className="text-white font-black text-4xl tracking-tighter">{booking.price}</p>
                        <div className="flex items-center gap-2 md:justify-end mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status" />
                          <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">Ready To Use</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                      <div className="space-y-1.5">
                        <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Booking Reference</p>
                        <div className="flex items-center gap-2 group/hash cursor-pointer">
                          <Hash size={12} className="text-indigo-500/40" />
                          <p className="text-white/60 font-mono text-[9px] truncate max-w-[120px] group-hover/hash:text-white transition-colors">
                            {booking.id.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Trip Details</p>
                        <p className="text-white/60 text-[10px] font-bold truncate max-w-[150px]">{booking.details}</p>
                      </div>

                      <div className="space-y-1.5 lg:col-span-2">
                        <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Trip Status</p>
                        <div className="flex gap-2">
                          <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                          <div className="h-1 flex-1 bg-emerald-500/20 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500 w-[40%] animate-pulse" />
                          </div>
                          <div className="h-1 flex-1 bg-white/5 rounded-full" />
                          <div className="h-1 flex-1 bg-white/5 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/30">
                          <span>Booked</span>
                          <span className="text-emerald-400">Ready</span>
                          <span>In Trip</span>
                          <span>Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id)}
                      className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${selectedBookingId === booking.id ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white'}`}
                    >
                      <QrCode size={14} /> {selectedBookingId === booking.id ? 'Hide Pass' : 'Show Pass'}
                    </button>
                    <button
                      onClick={() => handleSyncNode(booking.id)}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToWallet(booking)}
                      className="px-6 py-3 bg-black text-white border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                    >
                      {isProcessing === `wallet-${booking.id}` ? <RefreshCw className="animate-spin" size={14} /> : <Smartphone size={14} />}
                      Add to Apple Wallet
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(booking)}
                      className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-600/20 transition-all"
                      title="Download Receipt"
                    >
                      {isProcessing === `download-${booking.id}` ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                    </button>
                    <button className="px-6 py-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={14} /> Cancel
                    </button>
                  </div>
                </div>

                {selectedBookingId === booking.id && (
                  <div className="p-8 border-t border-white/5 bg-black/60 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                      <div className="shrink-0 p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(booking.id + booking.txHash)}&color=020617`}
                          className="w-32 h-32"
                          alt="Travel pass"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-xl text-white shadow-xl">
                          <ShieldCheck size={16} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                          <h5 className="text-white font-black text-xl uppercase tracking-tighter mb-2">Travel Pass</h5>
                          <p className="text-white/40 text-sm leading-relaxed max-w-md">
                            Show this QR code at check-in, the gate, or the front desk to access your booking quickly.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Booking ID</p>
                            <p className="text-white font-mono text-xs">{booking.id.toUpperCase()}</p>
                          </div>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Reference</p>
                            <p className="text-white font-mono text-xs">{booking.gdsNode || 'Travel Book'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleAddToWallet(booking)}
                            className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-2xl border border-white/20 hover:bg-white hover:text-black transition-all"
                          >
                            <Smartphone size={14} /> Add to Apple Wallet
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(booking)}
                            className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-2xl"
                          >
                            <Download size={14} /> Download Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <GlassCard className="p-10 border-indigo-500/30 bg-indigo-600/5 relative overflow-hidden glass-glow">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <AlertTriangle size={140} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-4">Need Help With A Booking?</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              If your plans change or something looks off, open support and we will walk you through the next step.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Fast Support</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                <Activity size={12} className="text-indigo-400" />
                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Booking Updates</span>
              </div>
            </div>
          </div>
          <button className="px-10 py-5 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Open Support
          </button>
        </div>
      </GlassCard>

      <style dangerouslySetInnerHTML={{ __html: `
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      ` }} />
    </div>
  );
};
