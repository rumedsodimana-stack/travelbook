'use client';

import React from 'react';
import {
  Briefcase,
  Car,
  Compass,
  Hotel,
  Plane,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { MembershipBadge } from '@/components/MembershipBadge';
import { User } from '@/types';
import { UserLabel } from '@/components/UserLabel';

interface BusinessHubViewProps {
  onProfileClick: (user: User) => void;
  onBookClick?: (business: User) => void;
}

const PROVIDER_GROUPS = [
  { title: 'Hotels', subtitle: 'Stays, resorts, and boutique rooms', icon: Hotel, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { title: 'Flights', subtitle: 'Airlines and route partners', icon: Plane, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { title: 'Transport', subtitle: 'Rail, airport, and city rides', icon: Car, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { title: 'Events', subtitle: 'Festivals, venues, and tickets', icon: Ticket, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { title: 'Tours', subtitle: 'Guided trips and local experiences', icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { title: 'Entertainment', subtitle: 'Nightlife, shows, and attractions', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
];

const FEATURED_PAGES: Array<{
  user: User;
  location: string;
  summary: string;
  priceLabel: string;
  stats: string;
}> = [
  {
    user: {
      id: 'biz-hotel-1',
      name: 'Grand Plaza Kyoto',
      username: '@grand_plaza_kyoto',
      avatar: 'https://picsum.photos/seed/grand-plaza-kyoto/300',
      accountType: 'provider',
      providerType: 'hotel',
      membershipTier: 'gold',
      category: 'Hotel Provider',
      isBusiness: true,
      bio: 'Modern city stay with creator-friendly rooftops, breakfast, and local district tours.',
    },
    location: 'Kyoto, Japan',
    summary: 'A hotel page that can post updates, collect reviews, and take direct bookings from travelers.',
    priceLabel: 'From $210',
    stats: '4.8 rating · 3.1k followers',
  },
  {
    user: {
      id: 'biz-flight-1',
      name: 'SkyLink Air',
      username: '@skylink_air',
      avatar: 'https://picsum.photos/seed/skylink-air/300',
      accountType: 'provider',
      providerType: 'flight',
      membershipTier: 'premium',
      category: 'Flight Provider',
      isBusiness: true,
      bio: 'Route updates, destination promos, and easy flight booking from one page.',
    },
    location: 'Dubai, UAE',
    summary: 'Airlines can share route stories, answer traveler questions, and convert discovery into bookings.',
    priceLabel: 'From $320',
    stats: '4.6 rating · 8.9k followers',
  },
  {
    user: {
      id: 'biz-tour-1',
      name: 'Island Trail Co.',
      username: '@island_trail_co',
      avatar: 'https://picsum.photos/seed/island-trail/300',
      accountType: 'provider',
      providerType: 'tour',
      membershipTier: 'premium',
      category: 'Tour Provider',
      isBusiness: true,
      bio: 'Curated day trips, small-group tours, and creator itineraries.',
    },
    location: 'Bali, Indonesia',
    summary: 'Tour businesses can showcase experiences, post social proof, and get booked straight from their page.',
    priceLabel: 'From $85',
    stats: '4.9 rating · 2.4k followers',
  },
  {
    user: {
      id: 'biz-event-1',
      name: 'Sunset Festival Live',
      username: '@sunset_festival_live',
      avatar: 'https://picsum.photos/seed/sunset-festival/300',
      accountType: 'provider',
      providerType: 'entertainment',
      membershipTier: 'gold',
      category: 'Entertainment Provider',
      isBusiness: true,
      bio: 'Live events, crowd moments, ticket drops, and creator collabs.',
    },
    location: 'Santorini, Greece',
    summary: 'Entertainment pages can publish live moments, sell tickets, and keep their community active.',
    priceLabel: 'From $49',
    stats: '4.7 rating · 5.7k followers',
  },
];

export const BusinessHubView: React.FC<BusinessHubViewProps> = ({ onProfileClick, onBookClick }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="overflow-hidden border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
              <Briefcase size={14} />
              Business pages built into the travel feed
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Travelers discover. Providers sell. Suppliers connect.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-white/70">
                Travel Book is a social platform for travelers, hotels, flights, tours, transport, events, entertainment brands, and supplier partners.
                Business pages can post, build trust, collect reviews, and turn attention into real bookings while suppliers connect inventory and systems behind the scenes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                Follow travelers and providers
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                Book straight from a page
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                Mix social proof with real inventory
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                Connect PMS and supplier systems
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <GlassCard className="border-indigo-500/20 bg-indigo-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-300">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">For travelers</p>
                  <p className="text-lg font-bold text-white">Share trips, save ideas, and book from trusted pages.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">For businesses</p>
                  <p className="text-lg font-bold text-white">Post, build trust, and monetize directly through your page.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black tracking-tight text-white">Provider Categories</h3>
          <p className="text-sm text-white/45">These are the main business types on the platform.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PROVIDER_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <GlassCard key={group.title} className="border-white/10 p-6 transition-all hover:border-white/20">
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-4 ${group.bg} ${group.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">{group.title}</h4>
                    <p className="text-sm leading-relaxed text-white/60">{group.subtitle}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black tracking-tight text-white">Featured Business Pages</h3>
          <p className="text-sm text-white/45">Pages can post like social profiles and sell like booking platforms.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {FEATURED_PAGES.map((page) => (
            <GlassCard key={page.user.id} className="overflow-hidden border-white/10 p-0">
              <div className="grid md:grid-cols-[180px,1fr]">
                <button
                  onClick={() => onProfileClick(page.user)}
                  className="h-full min-h-[200px] overflow-hidden bg-slate-950"
                >
                  <img
                    src={page.user.avatar}
                    alt={page.user.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </button>

                <div className="space-y-5 p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onProfileClick(page.user)} className="text-left">
                        <h4 className="text-2xl font-black tracking-tight text-white hover:text-indigo-300">
                          {page.user.name}
                        </h4>
                      </button>
                      <MembershipBadge tier={page.user.membershipTier} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <UserLabel category={page.user.category} isBusiness={page.user.isBusiness} />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                        {page.location}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/68">{page.summary}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                      <span>{page.stats}</span>
                      <span>{page.priceLabel}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => onProfileClick(page.user)}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10"
                    >
                      View Page
                    </button>
                    <button
                      onClick={() => onBookClick?.(page.user)}
                      className="flex-1 rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-all hover:scale-[1.01]"
                    >
                      Book From Page
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
