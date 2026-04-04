'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Search, MapPin, Sparkles, Hotel, Plane, Ticket, Car, Compass,
  Loader2, ChevronRight, ShieldCheck, Database, ArrowRight,
  Hash, Zap, Globe, Filter, X
} from 'lucide-react';
import { searchGlobalProviders } from '@/services/bookingService';
import { User } from '@/types';
import { MembershipBadge } from '@/components/MembershipBadge';
import { UserLabel } from '@/components/UserLabel';

interface SearchViewProps {
  onProfileClick: (user: User) => void;
  onNavigateToPlanner: () => void;
  onBookClick?: (business: User) => void;
}

const CATEGORY_ITEMS = [
  { id: 'hotel', label: 'Hotels', icon: Hotel, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'flight', label: 'Flights', icon: Plane, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'event', label: 'Events', icon: Ticket, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'tour', label: 'Tours', icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'entertainment', label: 'Entertainment', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
];

export const SearchView: React.FC<SearchViewProps> = ({ onProfileClick, onNavigateToPlanner, onBookClick }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPhase, setSearchPhase] = useState('');

  const activeCategoryLabel = CATEGORY_ITEMS.find((item) => item.id === activeCategory)?.label || 'Results';

  const handleDeepSearch = async (category: string, overrideQuery?: string) => {
    const searchQuery = overrideQuery !== undefined ? overrideQuery : query;
    setActiveCategory(category);
    setIsSearching(true);
    setSearchResults([]);

    const phases = [
      'Looking up matching options...',
      'Checking current availability...',
      'Pulling the best results together...',
    ];

    for (const phase of phases) {
      setSearchPhase(phase);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const results = await searchGlobalProviders(category, { location: searchQuery || 'Global' });
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const onMainSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleDeepSearch(activeCategory || 'hotel');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!activeCategory && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <GlassCard
            className="p-8 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent relative overflow-hidden group cursor-pointer hover:border-indigo-50 transition-all duration-500"
            onClick={onNavigateToPlanner}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shadow-xl">
                  <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em]">Quick Start</span>
                </div>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Build A Full Trip</h2>
              <p className="text-white/60 text-sm font-medium max-w-[280px] mb-8 leading-relaxed">
                Need more than a quick search? Open the planner to get a trip idea, then come back here to book through business pages.
              </p>
              <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-2xl">
                Open Trip Planner <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>

          <form onSubmit={onMainSearchSubmit} className="relative z-30">
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Search size={20} className="text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search a city, hotel, event, or route..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-32 py-5 text-white text-lg placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-2xl backdrop-blur-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
              >
                <Sparkles size={14} /> Search
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest ml-2">Browse By Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleDeepSearch(item.id)}
                    className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-white/30 transition-all group active:scale-95 shadow-xl"
                  >
                    <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeCategory && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex items-center justify-between">
              <button
                onClick={() => { setActiveCategory(null); setQuery(''); }}
                className="text-white/40 uppercase font-black text-[10px] flex items-center gap-2 hover:text-white transition-colors"
              >
                <X size={14} /> Back To Search
              </button>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Live Results</span>
              </div>
           </div>

           <form onSubmit={(e) => { e.preventDefault(); handleDeepSearch(activeCategory); }} className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                <Filter size={16} />
              </div>
              <input
                type="text"
                placeholder={`Refine ${activeCategoryLabel.toLowerCase()}...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
           </form>

           <div className="flex flex-col gap-1">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                {activeCategoryLabel}
              </h3>
              <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.4em]">Showing Results For: {query || 'Anywhere'}</p>
           </div>

           {isSearching ? (
             <div className="py-20 flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                    <Database size={24} />
                  </div>
                </div>
                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{searchPhase}</p>
             </div>
           ) : (
             <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <GlassCard className="p-12 text-center opacity-40">
                    <Globe className="mx-auto mb-4" size={48} />
                    <p className="text-white font-black uppercase tracking-widest text-xs">No matches found yet.</p>
                    <p className="mt-2 text-white/50 text-xs">Try a different place or switch categories.</p>
                  </GlassCard>
                ) : (
                  searchResults.map((res, idx) => (
                    <GlassCard
                      key={res.id}
                      className="p-0 overflow-hidden border-white/10 group hover:border-indigo-500/40 transition-all duration-500"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12">
                        <button
                          onClick={() => onProfileClick(res)}
                          className="md:col-span-3 relative h-40 overflow-hidden text-left md:h-auto"
                        >
                          <img
                            src={res.avatar || `https://picsum.photos/seed/${res.id}/400/300`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3">
                             <UserLabel category={res.category} showIcon={false} />
                          </div>
                        </button>

                        <div className="md:col-span-6 p-6 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => onProfileClick(res)} className="text-left">
                              <h4 className="text-white font-black text-xl tracking-tight group-hover:text-indigo-400 transition-colors">{res.name}</h4>
                            </button>
                            <MembershipBadge tier={res.membershipTier} compact />
                          </div>
                          <div className="flex flex-wrap gap-4 text-white/40 text-[9px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {res.location || 'Popular destination'}</span>
                            <span className="flex items-center gap-1 text-emerald-400/60"><Zap size={10} /> {res.provider}</span>
                          </div>

                          <div className="mt-4 flex gap-6 border-t border-white/5 pt-4">
                             {activeCategory === 'hotel' && (
                               <>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Availability</p>
                                   <p className="text-white/80 font-bold text-xs">Rooms available</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Amenities</p>
                                   <p className="text-white/80 font-bold text-xs">Gym • Spa • WiFi</p>
                                 </div>
                               </>
                             )}
                             {activeCategory === 'flight' && (
                               <>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Cabin</p>
                                   <p className="text-white/80 font-bold text-xs">{res.type || 'Economy'}</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Reference</p>
                                   <p className="text-white/80 font-bold text-xs">FLT-{res.id.slice(-4)}</p>
                                 </div>
                               </>
                             )}
                             {activeCategory === 'event' && (
                               <>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Availability</p>
                                   <p className="text-white/80 font-bold text-xs">Limited Stock</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Venue</p>
                                   <p className="text-white/80 font-bold text-xs">{res.location}</p>
                                 </div>
                               </>
                             )}
                             {activeCategory === 'tour' && (
                               <>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Format</p>
                                   <p className="text-white/80 font-bold text-xs">Guided experience</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Best for</p>
                                   <p className="text-white/80 font-bold text-xs">Couples • Groups</p>
                                 </div>
                               </>
                             )}
                             {activeCategory === 'entertainment' && (
                               <>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Type</p>
                                   <p className="text-white/80 font-bold text-xs">Live experience</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] text-white/20 uppercase font-black">Mood</p>
                                   <p className="text-white/80 font-bold text-xs">Nightlife • Shows</p>
                                 </div>
                               </>
                             )}
                          </div>
                        </div>

                        <div className="md:col-span-3 p-6 bg-white/5 flex flex-col items-center justify-center border-l border-white/5">
                          <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-1">From</p>
                          <p className="text-white font-black text-3xl tracking-tighter mb-4">
                            {res.price > 0 ? `$${res.price}` : 'FREE'}
                          </p>
                          <button
                            onClick={() => onProfileClick(res)}
                            className="mb-3 w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                          >
                            View Page
                          </button>
                          <button
                            onClick={() => onBookClick?.(res)}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                              activeCategory === 'event' ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-white text-slate-900 shadow-white/10'
                            }`}
                          >
                            {activeCategory === 'event' || activeCategory === 'entertainment' ? 'Book Tickets' : 'Book Now'} <ChevronRight size={14} />
                          </button>
                          <div className="mt-3 flex items-center gap-1.5 opacity-40">
                             <Hash size={8} className="text-white" />
                             <span className="text-[7px] font-mono uppercase tracking-tighter">VERIFIED LISTING</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))
                )}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
