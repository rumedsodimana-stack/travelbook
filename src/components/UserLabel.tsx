'use client';
import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

interface UserLabelProps { category?: string | null; isBusiness?: boolean; className?: string; showIcon?: boolean; }

export const UserLabel: React.FC<UserLabelProps> = ({ category = 'Traveler', isBusiness = false, className = '', showIcon = true }) => {
  const safeCategory = category || 'Traveler';
  const normalized = safeCategory.toLowerCase();
  let color = 'bg-white/10 text-white/70 border-white/15';
  let icon = <Compass size={10} />;

  if (isBusiness || normalized.includes('hotel') || normalized.includes('stay') || normalized.includes('resort') ||
    normalized.includes('event') || normalized.includes('flight') || normalized.includes('airline') ||
    normalized.includes('transport') || normalized.includes('rail') || normalized.includes('shuttle') ||
    normalized.includes('tour') || normalized.includes('entertainment') || normalized.includes('supplier') ||
    normalized.includes('channel manager') || normalized.includes('pms') || normalized.includes('technology partner') ||
    normalized.includes('provider') || normalized.includes('venue')) {
    color = 'bg-indigo-400/15 text-indigo-100 border-indigo-300/30';
    icon = <ShieldCheck size={10} />;
  } else if (normalized.includes('guide') || normalized.includes('nomad') || normalized.includes('explorer') ||
    normalized.includes('traveler') || normalized.includes('photographer')) {
    color = 'bg-emerald-400/15 text-emerald-100 border-emerald-300/30';
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${color} ${className}`}>
      {showIcon && icon}{safeCategory}
    </div>
  );
};
