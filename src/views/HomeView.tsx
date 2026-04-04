'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Post, User } from '@/types';
import {
  Heart, MessageCircle, Share2, MapPin, MoreHorizontal, ShieldCheck,
  Map as MapIcon, Zap, Globe, Cpu, Loader2, ArrowDown
} from 'lucide-react';
import { MapModal } from '@/components/MapModal';
import { MembershipBadge } from '@/components/MembershipBadge';
import { PostMediaRenderer } from '@/components/PostMediaRenderer';
import { UserLabel } from '@/components/UserLabel';
import { getMassiveFeed } from '@/services/dataFactory';

interface HomeViewProps {
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

export const HomeView: React.FC<HomeViewProps> = ({ posts, setPosts, onPostClick, onProfileClick }) => {
  const [activeMapLocation, setActiveMapLocation] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMorePosts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch = getMassiveFeed(page, 10);
      setPosts(prev => [...prev, ...nextBatch]);
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-10">
      {activeMapLocation && (
        <MapModal location={activeMapLocation} onClose={() => setActiveMapLocation(null)} />
      )}

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
                <button className="flex items-center gap-2 group"><Heart size={22} className="text-white group-hover:text-red-500" /><span className="text-white/60 text-xs font-bold">{formatNumber(post.likes)}</span></button>
                <button className="flex items-center gap-2 group"><MessageCircle size={22} className="text-white group-hover:text-blue-400" /><span className="text-white/60 text-xs font-bold">{formatNumber(post.comments)}</span></button>
                <button><Share2 size={22} className="text-white hover:text-emerald-400" /></button>
              </div>
              <button onClick={() => setActiveMapLocation(post.location || '')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all">
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
           {isLoadingMore ? "Loading More Stories..." : "Load More Stories"}
         </button>
      </div>
    </div>
  );
};
