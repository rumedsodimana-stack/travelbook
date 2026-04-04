'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Camera, MapPin, Send, X, Users, Video, Play, Radio, Loader2, Sparkles, Image as ImageIcon, Plus } from 'lucide-react';
import { Post, PostMedia } from '@/types';

interface CreatePostViewProps {
  onComplete: () => void;
  initialContent?: string;
  initialType?: Post['postType'];
}

export const CreatePostView: React.FC<CreatePostViewProps> = ({ onComplete, initialContent = '', initialType = 'story' }) => {
  const [content, setContent] = useState(initialContent);
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [postType, setPostType] = useState<Post['postType']>(initialType);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isStartingLive, setIsStartingLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialContent) setContent(initialContent);
    if (initialType) setPostType(initialType);
  }, [initialContent, initialType]);

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isLiveMode });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  useEffect(() => {
    if (isLiveMode) {
      startCameraPreview();
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [isLiveMode]);

  const handlePost = () => {
    if (isLiveMode) {
      setIsStartingLive(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      onComplete();
    }
  };

  const addImage = () => {
    const newMedia: PostMedia = {
      url: `https://picsum.photos/seed/${Math.random()}/800/600`,
      type: 'image'
    };
    setMedia([...media, newMedia]);
  };

  const addMultipleImages = () => {
    const newOnes: PostMedia[] = [1, 2, 3].map((n) => ({
      url: `https://picsum.photos/seed/${Math.random() * n}/800/600`,
      type: 'image'
    }));
    setMedia([...media, ...newOnes]);
  };

  const addVideo = () => {
    const newMedia: PostMedia = {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-on-a-mountain-road-4536-large.mp4',
      type: 'video'
    };
    setMedia([...media, newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const isSlideDeck = media.filter(m => m.type === 'image').length > 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-white">
          {isLiveMode ? 'Start Live Video' : (postType === 'buddy_request' ? 'Find Travel Buddies' : 'Create Post')}
        </h2>
        <button onClick={onComplete} className="text-white/60 hover:text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <GlassCard className={`p-6 relative overflow-hidden transition-all duration-500 ${isLiveMode ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-white/30'}`}>
        {!isLiveMode && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setPostType('story')}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${postType === 'story' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
            >
              Story
            </button>
            <button
              onClick={() => setPostType('blog')}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${postType === 'blog' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-white/40 border-white/10'}`}
            >
              Guide
            </button>
            <button
              onClick={() => setPostType('buddy_request')}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${postType === 'buddy_request' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/5 text-white/40 border-white/10'}`}
            >
              <Users size={10} /> Buddy Request
            </button>
          </div>
        )}

        {isLiveMode ? (
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black mb-6 group border border-red-500/30">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <Radio size={12} /> PREVIEW
            </div>
          </div>
        ) : (
          <>
            <textarea
              placeholder={postType === 'buddy_request' ? "Tell people about your trip and what kind of travel buddy you're looking for..." : "Share a place, tip, or travel update..."}
              className="w-full bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none resize-none min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {media.length > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between px-1">
                   <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                     {isSlideDeck ? <><Sparkles size={12} className="text-blue-400" /> PHOTO CAROUSEL</> : 'ATTACHED MEDIA'}
                   </p>
                   <span className="text-white font-black text-[10px]">{media.length} items</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {media.map((m, idx) => (
                    <div key={idx} className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/20 group shadow-xl">
                      {m.type === 'image' ? (
                        <img src={m.url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="relative w-full h-full bg-slate-800 flex items-center justify-center">
                          <video src={m.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play size={20} className="text-white fill-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-2 text-[8px] font-black text-white/60">#{idx + 1}</div>
                    </div>
                  ))}
                  <button
                    onClick={addImage}
                    className="w-28 h-28 shrink-0 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/60 hover:border-white/30 transition-all"
                  >
                    <Plus size={24} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Add more</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-4 mt-2 border-t border-white/10 pt-6">
          {!isLiveMode && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={addImage}
                className="bg-white/10 border border-white/10 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/20 transition-all text-white/70"
              >
                <ImageIcon size={20} />
                <span className="text-[7px] font-black uppercase tracking-widest">Photo</span>
              </button>
              <button
                onClick={addMultipleImages}
                className="bg-blue-500/20 border border-blue-500/30 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-blue-500/30 transition-all text-blue-400"
              >
                <Sparkles size={20} />
                <span className="text-[7px] font-black uppercase tracking-widest">Gallery</span>
              </button>
              <button
                onClick={addVideo}
                className="bg-white/10 border border-white/10 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/20 transition-all text-white/70"
              >
                <Video size={20} />
                <span className="text-[7px] font-black uppercase tracking-widest">Video</span>
              </button>
              <button
                onClick={() => setIsLiveMode(true)}
                className="bg-white/10 border border-white/10 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-red-500/20 hover:text-red-400 transition-all text-white/70"
              >
                <Radio size={20} />
                <span className="text-[7px] font-black uppercase tracking-widest">Live</span>
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {isLiveMode && (
              <button
                onClick={() => setIsLiveMode(false)}
                className="px-6 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handlePost}
              disabled={(!content && media.length === 0 && !isLiveMode) || isStartingLive}
              className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all ${
                isLiveMode
                  ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : (content || media.length > 0 ? 'bg-white text-slate-900 shadow-xl hover:scale-[1.02] active:scale-95' : 'bg-white/20 text-white/40 cursor-not-allowed')
              }`}
            >
              {isStartingLive ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isLiveMode ? <><Radio size={20} className="animate-pulse" /> Start Live Video</> : <><Send size={20} /> Share Post</>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
