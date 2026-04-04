'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Post, User } from '@/types';
import {
  X, Radio, Users, Heart, Share2,
  Send, ShieldCheck, Gift, Video, VideoOff,
  Mic, MicOff, Settings
} from 'lucide-react';

interface LiveStreamViewProps {
  post: Post;
  onClose: () => void;
  onProfileClick: (user: User) => void;
}

const EMOJI_REACTIONS = ['❤️', '🔥', '😍', '🌍', '👏', '✈️', '🎉', '😮'];

const MOCK_CHAT_SEED = [
  { user: 'TravelNode42', text: 'That view is unreal! GDS price?' },
  { user: 'SkyWalker', text: 'Swiss Alps route conditions look perfect today.' },
  { user: 'Elite_Voyager', text: 'Booked this for next month! 🏔️' },
  { user: 'NomadLife', text: 'Which airline did you fly with?' },
  { user: 'WanderlustCrew', text: 'The lighting is stunning 😍' },
];

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({ post, onClose, onProfileClick }) => {
  const [hearts, setHearts] = useState<{ id: number; left: number; emoji: string }[]>([]);
  const [comment, setComment] = useState('');
  const [liveComments, setLiveComments] = useState(MOCK_CHAT_SEED);
  const [isHostMode, setIsHostMode] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [viewerCount, setViewerCount] = useState(post.liveViewerCount || 1247);
  const [floatingEmoji, setFloatingEmoji] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate viewer count drift
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveComments]);

  // Simulate incoming messages
  useEffect(() => {
    const extras = [
      { user: 'Globetrotter99', text: 'Just joined! What destination is this?' },
      { user: 'FrequentFlyer', text: 'Premium cabin seats available?' },
      { user: 'AdventureSeek', text: 'Love the content! Keep it up 🔥' },
      { user: 'TravelPro', text: 'What camera are you using?' },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < extras.length) {
        setLiveComments(prev => [...prev, extras[idx]]);
        idx++;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addHeart = () => {
    const id = Date.now();
    const left = Math.random() * 60 + 20;
    setHearts(prev => [...prev, { id, left, emoji: '❤️' }]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
  };

  const sendEmojiReaction = (emoji: string) => {
    const id = Date.now();
    const left = Math.random() * 60 + 20;
    setFloatingEmoji(prev => [...prev, { id, emoji, left }]);
    setTimeout(() => setFloatingEmoji(prev => prev.filter(e => e.id !== id)), 2500);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLiveComments(prev => [...prev, { user: 'You', text: comment }]);
    setComment('');
  };

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-in fade-in duration-500">
      {/* Background stream simulation */}
      <div className="absolute inset-0 z-0">
        <img
          src={post.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200'}
          className="w-full h-full object-cover blur-[2px]"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/70" />
      </div>

      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {[...hearts, ...floatingEmoji].map(h => (
          <div
            key={h.id}
            className="absolute bottom-32 animate-float-heart text-3xl select-none"
            style={{ left: `${h.left}%` }}
          >
            {(h as { emoji: string }).emoji}
          </div>
        ))}
      </div>

      {/* Top Controls */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between gap-3">
        {/* Broadcaster info */}
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-3 py-2 pr-4 rounded-2xl border border-white/10 min-w-0">
          <button onClick={() => onProfileClick(post.author)} className="shrink-0">
            <img src={post.author.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/20" alt="" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-xs truncate">{post.author.name}</span>
              {post.author.isBusiness && <ShieldCheck size={12} className="text-blue-400 shrink-0" />}
            </div>
            <div className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Live Now</div>
          </div>
          <button className="ml-1 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0">
            Follow
          </button>
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
            <Radio size={12} /> LIVE
          </div>
          <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10">
            <Users size={12} /> {formatCount(viewerCount)}
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Host controls — shown when in host mode */}
      {isHostMode && (
        <div className="relative z-10 px-6 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-2xl border transition-all text-sm font-black flex items-center gap-2 ${
              isMicOn ? 'bg-white/10 border-white/10 text-white' : 'bg-red-500/30 border-red-500/50 text-red-400'
            }`}
          >
            {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            <span className="text-[9px] uppercase tracking-widest">{isMicOn ? 'Mic On' : 'Muted'}</span>
          </button>
          <button
            onClick={() => setIsCamOn(!isCamOn)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
              isCamOn ? 'bg-white/10 border-white/10 text-white' : 'bg-red-500/30 border-red-500/50 text-red-400'
            }`}
          >
            {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
            <span className="text-[9px] font-black uppercase tracking-widest">{isCamOn ? 'Cam On' : 'Cam Off'}</span>
          </button>
          <button className="p-3 bg-white/10 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all">
            <Settings size={18} />
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`ml-auto px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all ${
              isLive ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-600 text-white'
            }`}
          >
            <Radio size={14} className={isLive ? 'animate-pulse' : ''} />
            {isLive ? 'End Stream' : 'Go Live'}
          </button>
        </div>
      )}

      {/* Bottom content */}
      <div className="mt-auto relative z-10 p-4 sm:p-6 space-y-4">
        {/* Live chat */}
        <div className="max-w-xs space-y-2.5 h-40 overflow-hidden flex flex-col justify-end">
          <div
            className="space-y-2.5 overflow-y-auto scrollbar-hide"
            style={{ maskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
          >
            {liveComments.slice(-8).map((c, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-0.5 animate-in slide-in-from-left-4 duration-300"
              >
                <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">{c.user}</span>
                <p className="bg-black/40 backdrop-blur-md text-white text-xs py-2 px-3 rounded-xl border border-white/5 inline-block w-fit max-w-[240px]">
                  {c.text}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Emoji reactions bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmojiReaction(emoji)}
              className="shrink-0 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all shadow-xl"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input & action row */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSendComment} className="flex-1 flex items-center bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-2">
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder-white/30"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="p-2.5 bg-indigo-500 disabled:opacity-30 text-white rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Send size={16} />
            </button>
          </form>

          <button
            onClick={addHeart}
            className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-red-500 shadow-xl hover:scale-110 active:scale-90 transition-all"
          >
            <Heart size={22} fill="currentColor" />
          </button>

          <button className="p-4 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-2xl text-amber-400 shadow-xl hover:scale-110 transition-all">
            <Gift size={22} />
          </button>

          <button className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-xl hover:scale-110 transition-all">
            <Share2 size={22} />
          </button>
        </div>

        {/* Go Live button for viewer (host mode toggle) */}
        {!isHostMode && (
          <button
            onClick={() => setIsHostMode(true)}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2"
          >
            <Radio size={14} /> Start Your Own Live Stream
          </button>
        )}
      </div>

      <style>{`
        @keyframes float-heart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .animate-float-heart {
          animation: float-heart 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
