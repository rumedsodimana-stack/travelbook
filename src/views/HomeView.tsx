'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Post, User } from '@/types';
import {
  Heart, MessageCircle, Share2, MapPin, MoreHorizontal, ShieldCheck,
  Map as MapIcon, Zap, Globe, Cpu, Loader2, ArrowDown, Plus
} from 'lucide-react';
import { MapModal } from '@/components/MapModal';
import { MembershipBadge } from '@/components/MembershipBadge';
import { PostMediaRenderer } from '@/components/PostMediaRenderer';
import { UserLabel } from '@/components/UserLabel';
import { getMassiveFeed } from '@/services/dataFactory';

interface HomeViewProps {
  onNavigateToAIPlanner?: () => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  onPostClick: (post: Post) => void;
  onProfileClick: (user: User) => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const STORY_USERS = [
  { id: 's0', name: 'Add Story', avatar: 'https://picsum.photos/seed/demo-user/200', isAdd: true },
  { id: 's1', name: 'Elena', avatar: 'https://picsum.photos/seed/elena/200', hasStory: true },
  { id: 's2', name: 'Marcus', avatar: 'https://picsum.photos/seed/marcus/200', hasStory: true },
  { id: 's3', name: 'Aria', avatar: 'https://picsum.photos/seed/aria-solo/200', hasStory: true },
  { id: 's4', name: 'Kyoto Inn', avatar: 'https://picsum.photos/seed/kyoto-inn/200', hasStory: true, isBusiness: true },
  { id: 's5', name: 'James', avatar: 'https://picsum.photos/seed/james-t/200', hasStory: true },
  { id: 's6', name: 'Swiss Air', avatar: 'https://picsum.photos/seed/swiss-air/200', hasStory: false, isBusiness: true },
  { id: 's7', name: 'Nina', avatar: 'https://picsum.photos/seed/nina-v/200', hasStory: true },
  { id: 's8', name: 'Santorini', avatar: 'https://picsum.photos/seed/santorini-h/200', hasStory: true, isBusiness: true },
  { id: 's9', name: 'Leo K', avatar: 'https://picsum.photos/seed/leo-k/200', hasStory: true },
];

const SUGGESTED_USERS = [
  { id: 'su1', name: 'Mei Lin', username: '@meilin_travels', avatar: 'https://picsum.photos/seed/mei-lin/200', category: 'Solo Traveler', followers: '12.4k' },
  { id: 'su2', name: 'Grand Zermatt', username: '@grandzermatt', avatar: 'https://picsum.photos/seed/zermatt-hotel/200', category: 'Hotel', isBusiness: true, followers: '8.9k' },
  { id: 'su3', name: 'Riku Sato', username: '@riku_nomad', avatar: 'https://picsum.photos/seed/riku-sato/200', category: 'Digital Nomad', followers: '5.2k' },
  { id: 'su4', name: 'Atlas Tours', username: '@atlastours', avatar: 'https://picsum.photos/seed/atlas-tours/200', category: 'Tour Guide', isBusiness: true, followers: '3.1k' },
  { id: 'su5', name: 'Sophia M', username: '@sophiatravels', avatar: 'https://picsum.photos/seed/sophia-m/200', category: 'Photographer', followers: '21k' },
];

const TRENDING_DESTINATIONS = [
  '🇯🇵 Kyoto, Japan',
  '🇨🇭 Zermatt',
  '🇮🇩 Bali',
  '🇬🇷 Santorini',
  '🇲🇦 Marrakesh',
];

export const HomeView: React.FC<HomeViewProps> = ({ posts, setPosts, onPostClick, onProfileClick, onNavigateToAIPlanner }) => {
  const [activeMapLocation, setActiveMapLocation] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const loadMorePosts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch = getMassiveFeed(page, 10);
      setPosts(prev => [...prev, ...nextBatch]);
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 1000);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  return (
    <div className="flex gap-8 items-start">
      {activeMapLocation && (
        <MapModal location={activeMapLocation} onClose={() => setActiveMapLocation(null)} />
      )}

      {/* Main Feed Column */}
      <div className="flex-1 min-w-0 space-y-8 pb-10">
        {/* Banner */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Globe size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">Travelers share experiences and businesses share bookable offers</span>
            </div>
            <div className="flex items-center gap-2 text-white/45">
              <Cpu size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">Follow pages, compare options, and book from the same app</span>
            </div>
          </div>
        </div>

        {/* Story Bubbles Row */}
        <GlassCard className="p-5 border-white/10">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-1">
            {STORY_USERS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                <div className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all group-hover:scale-110 shadow-xl ${
                  s.isAdd
                    ? 'border-2 border-dashed border-white/30 bg-white/5'
                    : s.hasStory
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950'
                      : 'border-2 border-white/20'
                }`}>
                  <img src={s.avatar} className="w-full h-full object-cover" alt={s.name} />
                  {s.isAdd && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Plus size={22} className="text-white" />
                    </div>
                  )}
                  {(s as { isBusiness?: boolean }).isBusiness && !s.isAdd && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-md p-0.5 border border-slate-950">
                      <ShieldCheck size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-white/50 text-[9px] font-black uppercase tracking-widest truncate max-w-[60px] text-center">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Trip Planner CTA */}
        {onNavigateToAIPlanner && (
          <button
            onClick={onNavigateToAIPlanner}
            className="w-full text-left rounded-[2.5rem] border border-teal-500/30 bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-teal-500/5 p-5 shadow-[0_0_30px_rgba(20,184,166,0.12)] backdrop-blur-xl transition-all hover:border-teal-500/50 hover:shadow-[0_0_40px_rgba(20,184,166,0.2)] hover:scale-[1.01] active:scale-100"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/30 text-2xl">
                  ✨
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-0.5">New Feature</p>
                  <p className="text-base font-black text-white leading-tight">Plan My Trip with AI</p>
                  <p className="text-xs text-white/50 mt-0.5">Flights · Hotels · Activities · Full timeline</p>
                </div>
              </div>
              <div className="flex-shrink-0 rounded-2xl bg-teal-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-teal-500/30">
                Try it →
              </div>
            </div>
          </button>
        )}

        {/* Post Feed */}
        {posts.map((post) => (
          <GlassCard
            key={post.id}
            className={`overflow-hidden transition-all duration-500 animate-in slide-in-from-bottom-8 ${
              post.isPromoted
                ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20'
                : 'border-white/20'
            }`}
          >
            {post.isPromoted && (
              <div className="bg-indigo-600/10 px-6 py-2 border-b border-indigo-500/20 flex items-center justify-between">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-1.5">
                  <Zap size={10} /> Featured Business Page
                </span>
                <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest">Ready for direct booking</span>
              </div>
            )}

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onProfileClick(post.author)}>
                <div className="w-12 h-12 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl bg-slate-900">
                  <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-sm leading-none group-hover:text-indigo-400 transition-colors">{post.author.name}</h3>
                    <MembershipBadge tier={post.author.membershipTier} compact />
                    <UserLabel category={post.author.category} isBusiness={post.author.isBusiness} />
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-bold uppercase tracking-widest">
                    <span>{post.timestamp}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <MapPin size={10} /> {post.location}
                  </div>
                </div>
              </div>
              <button className="p-2 text-white/40 hover:text-white"><MoreHorizontal size={24} /></button>
            </div>

            <div className="cursor-pointer overflow-hidden bg-slate-950" onClick={() => onPostClick(post)}>
              <PostMediaRenderer post={post} />
            </div>

            <div className="p-6">
              <p className="text-white/90 text-sm leading-relaxed mb-6 line-clamp-2" onClick={() => onPostClick(post)}>{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    className="flex items-center gap-2 group active:scale-90 transition-transform"
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart
                      size={22}
                      className={`transition-all duration-200 ${likedPosts.has(post.id) ? 'text-red-500 fill-red-500 scale-110' : 'text-white group-hover:text-red-400'}`}
                    />
                    <span className={`text-xs font-bold transition-colors ${likedPosts.has(post.id) ? 'text-red-400' : 'text-white/60'}`}>
                      {formatNumber(post.likes + (likedPosts.has(post.id) ? 1 : 0))}
                    </span>
                  </button>
                  <button className="flex items-center gap-2 group" onClick={() => onPostClick(post)}>
                    <MessageCircle size={22} className="text-white group-hover:text-blue-400" />
                    <span className="text-white/60 text-xs font-bold">{formatNumber(post.comments)}</span>
                  </button>
                  <button><Share2 size={22} className="text-white hover:text-emerald-400" /></button>
                </div>
                <button
                  onClick={() => setActiveMapLocation(post.location || '')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                >
                  <MapIcon size={12} /> View On Map
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        <div className="flex justify-center pt-10">
          <button
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className="px-12 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-white font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : <ArrowDown size={16} />}
            {isLoadingMore ? 'Loading More Stories...' : 'Load More Stories'}
          </button>
        </div>
      </div>

      {/* Suggested Users Sidebar — desktop only */}
      <div className="hidden xl:flex flex-col gap-4 w-72 shrink-0 sticky top-6">
        <GlassCard className="p-6 border-white/10">
          <h3 className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-5">Suggested for you</h3>
          <div className="space-y-4">
            {SUGGESTED_USERS.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  </div>
                  {user.isBusiness && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded p-0.5 border border-slate-950">
                      <ShieldCheck size={7} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs truncate">{user.name}</p>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest truncate">
                    {user.category} · {user.followers}
                  </p>
                </div>
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                    followedUsers.has(user.id)
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {followedUsers.has(user.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors py-3 border-t border-white/5">
            See All Suggestions
          </button>
        </GlassCard>

        <GlassCard className="p-6 border-white/10">
          <h3 className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-4">Trending Destinations</h3>
          <div className="space-y-3">
            {TRENDING_DESTINATIONS.map((dest, i) => (
              <div key={i} className="flex items-center justify-between cursor-pointer group">
                <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">{dest}</span>
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">#{i + 1}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
