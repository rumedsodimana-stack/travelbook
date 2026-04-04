'use client';
import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { MembershipTier } from '@/types';
import { getMembershipLabel, resolveMembershipBadgeTone } from '@/services/identityService';

interface MembershipBadgeProps { tier?: MembershipTier; className?: string; compact?: boolean; showStandard?: boolean; }

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({ tier = 'standard', className = '', compact = false, showStandard = false }) => {
  if (tier === 'standard' && !showStandard) return null;
  const tone = resolveMembershipBadgeTone(tier);
  const styles = tone === 'gold' ? 'border-amber-300/35 bg-amber-300/15 text-amber-100'
    : tone === 'blue' ? 'border-sky-300/35 bg-sky-400/15 text-sky-100' : 'border-white/15 bg-white/10 text-white/70';
  const icon = tone === 'gold' ? <Award size={compact ? 11 : 12} /> : <ShieldCheck size={compact ? 11 : 12} />;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${compact ? 'px-2' : 'px-2.5'} py-1 text-[9px] font-black uppercase tracking-[0.16em] ${styles} ${className}`}>
      {icon}{tier === 'gold' ? 'Gold' : tier === 'premium' ? 'Blue' : getMembershipLabel(tier)}
    </span>
  );
};
