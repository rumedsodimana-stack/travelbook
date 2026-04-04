'use client';
import React, { useState } from 'react';
import { Post } from '@/types';
import { Radio, ChevronLeft, ChevronRight } from 'lucide-react';

interface PostMediaRendererProps { post: Post; aspectRatio?: string; onMapClick?: (location: string) => void; }

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

export const PostMediaRenderer: React.FC<PostMediaRendererProps> = ({ post, aspectRatio = "aspect-[16/10]" }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (post.isLive) {
    return (
      <div className={`w-full relative bg-slate-900 overflow-hidden group ${aspectRatio === "aspect-[16/10]" ? "aspect-[9/16] sm:aspect-video" : aspectRatio}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />
        <img src={post.author.avatar} className="w-full h-full object-cover blur-xl opacity-40" alt="Live background" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <Radio size={40} className="text-white" />
          </div>
        </div>
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
          </div>
          <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10 shadow-xl">
            {formatNumber(post.liveViewerCount || 0)} VIEWERS
          </div>
        </div>
      </div>
    );
  }

  if (post.videoUrl) {
    return (
      <div className={`w-full relative group bg-black overflow-hidden ${aspectRatio}`}>
        <video src={post.videoUrl} controls className="w-full h-full object-cover"
          poster={post.imageUrl || `https://picsum.photos/seed/vid-${post.id}/1200/800`} />
        <div className="absolute inset-0 pointer-events-none bg-black/10 group-hover:bg-transparent transition-all" />
      </div>
    );
  }

  if (post.mediaList && post.mediaList.length > 0) {
    return (
      <div className={`w-full relative group overflow-hidden ${aspectRatio}`}>
        <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {post.mediaList.map((m, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <img src={m.url} className="w-full h-full object-cover" alt={`Slide ${i + 1}`} />
            </div>
          ))}
        </div>
        {post.mediaList.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button disabled={activeSlide === 0} onClick={(e) => { e.stopPropagation(); setActiveSlide(s => Math.max(0, s - 1)); }}
                className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white disabled:opacity-0 hover:bg-black/60 transition-all pointer-events-auto shadow-2xl"><ChevronLeft size={24} /></button>
              <button disabled={activeSlide === post.mediaList!.length - 1} onClick={(e) => { e.stopPropagation(); setActiveSlide(s => Math.min(post.mediaList!.length - 1, s + 1)); }}
                className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white disabled:opacity-0 hover:bg-black/60 transition-all pointer-events-auto shadow-2xl"><ChevronRight size={24} /></button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {post.mediaList.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-6 bg-white shadow-xl' : 'w-1.5 bg-white/40'}`} />))}
            </div>
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full border border-white/10 shadow-xl z-20">
              {activeSlide + 1} / {post.mediaList.length}
            </div>
          </>
        )}
      </div>
    );
  }

  return post.imageUrl ? (
    <div className={`w-full overflow-hidden relative group ${aspectRatio}`}>
      <img src={post.imageUrl} alt="Journey" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  ) : null;
};
