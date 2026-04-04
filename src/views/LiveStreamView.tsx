'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Post, User } from '@/types';
import {
  X, Radio, Users, Heart, Share2,
  Send, MoreHorizontal, ShieldCheck,
  MessageCircle, Star, Music, Gift, Bot
} from 'lucide-react';

interface LiveStreamViewProps {
  post: Post;
  onClose: () => void;
  onProfileClick: (user: User) => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({ post, onClose, onProfileClick }) => {
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const [comment, setComment] = useState('');
  const [liveComments, setLiveComments] = useState([
    { user: 'TravelNode42', text: 'That view is unreal! GDS price?' },
    { user: 'SkyWalker', text: 'Swiss Alps route conditions look perfect today.' },
    { user: 'Elite_Voyager', text: 'Booked this for next month! 🏔️' }
  ]);

  const addHeart = () => {
    const id = Date.now();
    const left = Math.random() * 60 + 20;
    setHearts(prev => [...prev, { id, left }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLiveComments(prev => [...prev, { user: 'You', text: comment }]);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-in fade-in duration-500">
      {/* Background Simulated Stream */}
      <div className="absolute inset-0 z-0">
        <img src={post.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200'} className="w-full h-full object-cover blur-[2px]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />
      </div>

      {/* Top Controls */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 pr-4 rounded-2xl border border-white/10">
          <div className="cursor-pointer" onClick={() => onProfileClick(post.author)}>
            <img src={post.author.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/20" alt="" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-xs">{post.author.name}</span>
              {post.author.isBusiness && <ShieldCheck size={12} className="text-blue-400" />}
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-black uppercase tracking-widest">
              <span className="text-emerald-400">Online</span> • {post.author.category}
            </div>
          </div>
          <button className="ml-2 bg-indigo-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Follow</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
            <Radio size={12} /> LIVE
          </div>
          <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10">
            <Users size={12} /> {post.liveViewerCount || '1.2k'}
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Floating Hearts Container */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {hearts.map(h => (
          <div
            key={h.id}
            className="absolute bottom-32 animate-float-heart"
            style={{ left: `${h.left}%` }}
          >
            <Heart size={32} className="text-red-500 fill-red-500 drop-shadow-xl" />
          </div>
        ))}
      </div>

      {/* Bottom Content Area */}
      <div className="mt-auto relative z-10 p-6 space-y-6">
        {/* Live Chat Ledger */}
        <div className="max-w-xs space-y-3 mask-fade-top">
          {liveComments.map((c, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">{c.user}</span>
              <p className="bg-black/30 backdrop-blur-md text-white text-xs py-2 px-3 rounded-xl border border-white/5 inline-block w-fit">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSendComment} className="flex-1 flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2">
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg active:scale-95 transition-all">
              <Send size={18} />
            </button>
          </form>

          <button
            onClick={addHeart}
            className="p-5 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-red-500 shadow-xl hover:scale-110 active:scale-90 transition-all"
          >
            <Heart size={24} fill="currentColor" />
          </button>

          <button className="p-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-xl hover:scale-110 transition-all">
            <Gift size={24} />
          </button>

          <button className="p-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-xl hover:scale-110 transition-all">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      <style>{`
        .mask-fade-top {
          -webkit-mask-image: linear-gradient(to top, black 80%, transparent 100%);
          mask-image: linear-gradient(to top, black 80%, transparent 100%);
        }
        @keyframes float-heart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .animate-float-heart {
          animation: float-heart 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
