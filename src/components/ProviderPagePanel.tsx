'use client';

import React from 'react';
import {
  BedDouble,
  CheckCircle2,
  CreditCard,
  Link2,
  Minus,
  Plus,
  Rocket,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { User } from '@/types';
import {
  adjustProviderRoomInventory,
  connectProviderSystem,
  enableProviderDirectBooking,
  getConnectionStatusLabel,
  getHotelLiveRoomCount,
  getHotelLowestRate,
  getProviderPageStageLabel,
  polishProviderContent,
} from '@/services/providerPageService';

interface ProviderPagePanelProps {
  user: User;
  isOwnProfile?: boolean;
  onUpdateProfile?: (user: User) => void;
  onBookClick?: (business: User) => void;
}

export const ProviderPagePanel: React.FC<ProviderPagePanelProps> = ({
  user,
  isOwnProfile = false,
  onUpdateProfile,
  onBookClick,
}) => {
  const providerPage = user.providerPage;

  if (!providerPage || user.accountType !== 'provider') {
    return null;
  }

  const liveRooms = getHotelLiveRoomCount(providerPage);
  const lowestRate = getHotelLowestRate(providerPage);
  const isHotel = user.providerType === 'hotel';

  const applyUpdate = (nextUser: User) => {
    if (onUpdateProfile) {
      onUpdateProfile(nextUser);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Provider page</p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-white">{providerPage.headline}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{providerPage.summary}</p>
          </div>
          {!isOwnProfile && providerPage.directBookingEnabled && (
            <button
              onClick={() => onBookClick?.(user)}
              className="rounded-2xl bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950 transition-all hover:scale-[1.01]"
            >
              Book From Page
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Setup stage</p>
            <p className="mt-2 text-lg font-black text-white">{getProviderPageStageLabel(providerPage.setupStage)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Connection</p>
            <p className="mt-2 text-lg font-black text-white">{getConnectionStatusLabel(providerPage.connectionStatus)}</p>
            <p className="mt-1 text-[10px] text-white/45">{providerPage.connectionLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Direct booking</p>
            <p className="mt-2 text-lg font-black text-white">
              {providerPage.directBookingEnabled ? 'Enabled' : 'Not live yet'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
              {isHotel ? 'Rooms live' : 'Content score'}
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {isHotel ? `${liveRooms} live` : `${providerPage.contentScore}%`}
            </p>
            {isHotel && lowestRate !== null && (
              <p className="mt-1 text-[10px] text-white/45">From ${lowestRate}/night</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {providerPage.highlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {isOwnProfile && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Page controls</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button
              onClick={() => applyUpdate(connectProviderSystem(user))}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-all hover:bg-white/5"
            >
              <Link2 size={18} className="text-sky-300" />
              <p className="mt-3 text-sm font-black text-white">Connect current system</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">Mark the page as connected to a PMS, channel manager, or API path.</p>
            </button>
            <button
              onClick={() => applyUpdate(polishProviderContent(user))}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-all hover:bg-white/5"
            >
              <Star size={18} className="text-amber-300" />
              <p className="mt-3 text-sm font-black text-white">Polish page content</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">Improve page readiness, social proof, and search quality before launch.</p>
            </button>
            <button
              onClick={() => applyUpdate(enableProviderDirectBooking(user))}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-all hover:bg-white/5"
            >
              <Rocket size={18} className="text-emerald-300" />
              <p className="mt-3 text-sm font-black text-white">Enable direct booking</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">Turn the page into a live booking surface and mark payouts ready.</p>
            </button>
          </div>
        </div>
      )}

      {isHotel && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Hotel inventory</p>
              <h4 className="mt-2 text-lg font-black text-white">Room setup and nightly rates</h4>
            </div>
            {providerPage.directBookingEnabled && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                <CheckCircle2 size={12} />
                Booking ready
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {(providerPage.roomTypes || []).map((room) => (
              <div key={room.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BedDouble size={16} className="text-amber-300" />
                      <h5 className="text-sm font-black text-white">{room.name}</h5>
                    </div>
                    <p className="mt-2 text-sm text-white/60">
                      ${room.nightlyRate}/night · Sleeps {room.capacity} · {room.highlights.join(' · ')}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                      Status: {room.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOwnProfile ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applyUpdate(adjustProviderRoomInventory(user, room.id, -1))}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Inventory</p>
                          <p className="text-sm font-black text-white">{room.inventory}</p>
                        </div>
                        <button
                          onClick={() => applyUpdate(adjustProviderRoomInventory(user, room.id, 1))}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Available</p>
                        <p className="text-sm font-black text-white">{room.inventory} rooms</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white">
                <CreditCard size={16} className="text-emerald-300" />
                <span className="text-sm font-black">Payouts</span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                {providerPage.payoutReady ? 'Ready for payouts and direct settlement.' : 'Complete payout setup before going fully live.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck size={16} className="text-sky-300" />
                <span className="text-sm font-black">Policies</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{providerPage.policies.join(' · ')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white">
                <Star size={16} className="text-amber-300" />
                <span className="text-sm font-black">Amenities</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{providerPage.amenities.join(' · ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
