'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { User, Booking } from '@/types';
import {
  ShieldCheck, X, Loader2, CheckCircle2, Ticket,
  ArrowRight, CreditCard, Sparkles, Database, Cpu,
  Smartphone, Globe, Lock, Wallet, Zap,
  ChevronRight, CreditCard as CardIcon, Car,
  Calendar, Users, Clock, MapPin, Plane, Utensils, Info,
  Hotel, Plus, Minus, Hash, QrCode, BedDouble
} from 'lucide-react';

interface ReservationModalProps {
  business: User;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

type PaymentMethod = 'card' | 'apple_pay' | 'crypto' | 'stripe';

export const ReservationModal: React.FC<ReservationModalProps> = ({ business, onClose, onConfirm }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirming' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [txHash, setTxHash] = useState('');
  const [ticketCount, setTicketCount] = useState(1);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: '2',
    time: '19:00',
    origin: 'SFO',
    destination: 'HND',
    class: 'Economy',
    specialRequests: ''
  });

  const categoryLower = business.category?.toLowerCase() || '';
  const isEvent = categoryLower.includes('event') || categoryLower.includes('festival');
  const isHotel = categoryLower.includes('hotel') || categoryLower.includes('lodge');
  const isDining = categoryLower.includes('restaurant') || categoryLower.includes('dining');
  const isFlight = categoryLower.includes('flight') || categoryLower.includes('airline');
  const isCar = categoryLower.includes('car') || categoryLower.includes('transport');
  const isExperience = categoryLower.includes('tour') || categoryLower.includes('entertainment') || categoryLower.includes('experience') || categoryLower.includes('activity');
  const hotelRoomOptions = business.providerPage?.roomTypes || [];
  const [selectedRoomId, setSelectedRoomId] = useState(hotelRoomOptions[0]?.id || '');
  const [selectedGds, setSelectedGds] = useState(business.providerPage?.connectionLabel || 'Sabre');

  const type: Booking['type'] = isEvent || isExperience ? 'event' : (isHotel ? 'hotel' : (isDining ? 'restaurant' : (isFlight ? 'flight' : 'car')));
  const selectedRoom = hotelRoomOptions.find((room) => room.id === selectedRoomId) || hotelRoomOptions[0];

  const getNightCount = () => {
    if (!isHotel) {
      return 1;
    }

    const start = new Date(formData.date);
    const end = new Date(formData.endDate || formData.date);
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
    return Math.max(1, nights);
  };

  const getBasePrice = () => {
    if (isFlight) return 1200;
    if (isHotel) return selectedRoom?.nightlyRate || 450;
    if (isEvent) return business.name.includes('Tomorrowland') ? 345 : 120;
    if (isExperience) return 95;
    if (isCar) return 85;
    return 120;
  };

  const calculateTotal = () => {
    const base = getBasePrice();
    if (isEvent) return `$${base * ticketCount}`;
    if (isHotel) return `$${base * getNightCount()}`;
    if (isCar) return `$${base * (parseInt(formData.guests) || 1)}`;
    return `$${base}`;
  };

  useEffect(() => {
    if (step === 'confirming') {
      const timer = setTimeout(() => {
        setTxHash(`0x${Math.random().toString(16).slice(2, 12)}`);
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = () => {
    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      type,
      title: business.name,
      subtitle: isEvent
        ? `${ticketCount} ticket${ticketCount > 1 ? 's' : ''}`
        : isFlight
          ? `${formData.origin} to ${formData.destination}`
          : isHotel
            ? `${selectedRoom?.name || 'Room'} • ${getNightCount()} night${getNightCount() > 1 ? 's' : ''}`
            : business.category || 'Travel booking',
      date: formData.date || 'Pending Sync',
      status: 'confirmed',
      price: calculateTotal(),
      details: isEvent
        ? `QR pass for ${ticketCount} guest${ticketCount > 1 ? 's' : ''}`
        : isHotel
          ? `${formData.date} to ${formData.endDate} • Sleeps ${selectedRoom?.capacity || formData.guests}`
          : `${formData.time} • Confirmed`,
      category: business.category,
      roomTypeName: isHotel ? selectedRoom?.name : undefined,
      nights: isHotel ? getNightCount() : undefined,
      ticketCount: isEvent ? ticketCount : undefined,
      txHash: txHash || `0x${Math.random().toString(16).slice(2, 12)}`,
      settleTime: new Date().toLocaleTimeString(),
      gdsNode: selectedGds,
      lifecycleStage: 'settled'
    };
    onConfirm(newBooking);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={step === 'confirming' ? undefined : onClose} />

      <GlassCard className="relative w-full max-w-md overflow-hidden border-white/30 shadow-2xl">
        {step === 'details' && (
          <div className="p-8 animate-in slide-in-from-bottom-4 duration-500 max-h-[85vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-black text-2xl tracking-tight uppercase">Complete Booking</h3>
                <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Review the details before you pay</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors" />
              <img src={business.avatar} className="w-16 h-16 rounded-2xl object-cover border border-white/20 relative z-10" alt="" />
              <div className="relative z-10">
                <h4 className="text-white font-bold text-lg leading-tight">{business.name}</h4>
                <p className="text-indigo-400 text-[10px] uppercase font-black tracking-widest mt-1">{business.category}</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                  <Database size={12} /> Booking Provider
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm appearance-none"
                  value={selectedGds}
                  onChange={(e) => setSelectedGds(e.target.value)}
                >
                  <option className="bg-slate-900" value="Sabre">Sabre</option>
                  <option className="bg-slate-900" value="Amadeus">Amadeus</option>
                  <option className="bg-slate-900" value="Travelport">Travelport</option>
                </select>
              </div>

              {isEvent ? (
                <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-white font-black text-xs uppercase tracking-widest">Tickets</p>
                    <p className="text-white/20 text-[9px] uppercase font-bold mt-1">Choose how many you need</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="p-2 bg-white/5 rounded-xl text-white hover:bg-white/10"><Minus size={16} /></button>
                    <span className="text-white font-black text-xl w-6 text-center">{ticketCount}</span>
                    <button onClick={() => setTicketCount(ticketCount + 1)} className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500"><Plus size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                        <Calendar size={12} /> Date
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none text-sm"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                        <Clock size={12} /> Time
                      </label>
                      <input type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                    </div>
                  </div>
                  {isHotel && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                            <Hotel size={12} /> Check-out
                          </label>
                          <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none text-sm"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                            <Users size={12} /> Guests
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none text-sm"
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          />
                        </div>
                      </div>

                      {hotelRoomOptions.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-white/40 text-[9px] uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                            <BedDouble size={12} /> Room type
                          </label>
                          <select
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm appearance-none"
                            value={selectedRoom?.id || ''}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                          >
                            {hotelRoomOptions.map((room) => (
                              <option key={room.id} className="bg-slate-900" value={room.id}>
                                {room.name} · ${room.nightlyRate}/night · {room.inventory} rooms
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Estimated Total</p>
                  <p className="text-white font-black text-3xl tracking-tighter">{calculateTotal()}</p>
                  {isHotel && (
                    <p className="mt-1 text-[10px] text-white/45">
                      {selectedRoom?.name || 'Selected room'} · {getNightCount()} night{getNightCount() > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mb-1" />
                  <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Current Demo Price</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full bg-white text-slate-900 p-5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue To Payment <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button onClick={() => setStep('details')} className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1 hover:text-white transition-colors">← Back To Details</button>
                <h3 className="text-white font-black text-2xl tracking-tight uppercase">Choose Payment</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone, desc: 'Fast checkout on this device', color: 'bg-white' },
                { id: 'crypto', name: 'Travel Wallet', icon: Wallet, desc: 'Pay with your wallet balance', color: 'bg-indigo-500' },
                { id: 'card', name: 'Bank Card', icon: CardIcon, desc: 'Pay with a credit or debit card', color: 'bg-blue-500' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id as PaymentMethod); setStep('confirming'); }}
                    className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${m.color} bg-opacity-20 text-white`}><Icon size={20} /></div>
                      <div className="text-left">
                        <p className="text-white font-bold text-sm leading-none mb-1">{m.name}</p>
                        <p className="text-white/40 text-[9px] uppercase font-black tracking-widest">{m.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mx-auto w-24 h-24 mb-10">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-4 rounded-full border-2 border-emerald-500/10 border-t-emerald-500 animate-spin [animation-direction:reverse] [animation-duration:2s]" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                <Cpu size={32} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-white font-black text-2xl mb-4 tracking-tight uppercase">Confirming Your Booking</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Please wait a moment...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-10 text-center animate-in zoom-in-95 duration-700 max-h-[85vh] overflow-y-auto scrollbar-hide">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h3 className="text-white font-black text-3xl mb-2 tracking-tight uppercase">Booking Confirmed</h3>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">Provider: {selectedGds}</p>

            <div className="bg-white p-6 rounded-3xl mb-8 flex flex-col items-center gap-4 shadow-2xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(txHash)}&color=020617`}
                className="w-32 h-32"
                alt="Booking pass"
              />
              <div className="space-y-1">
                <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Booking Pass</p>
                <p className="text-slate-400 font-mono text-[9px] break-all">{txHash}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
                <span>Booking Type</span>
                <span className="text-white">{type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
                <span>Confirmed At</span>
                <span className="text-white">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-indigo-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              View Booking
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
