'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Camera, MapPin, Send, X, Users, Video, Play, Radio,
  Loader2, Sparkles, Image as ImageIcon, Plus, Lock, Globe, UserCheck
} from 'lucide-react';
import { Post, PostMedia } from '@/types';

interface CreatePostViewProps {
  onComplete: () => void;
  initialContent?: string;
  initialType?: Post['postType'];
}

type AudienceOption = 'public' | 'friends' | 'private';

const AUDIENCE_OPTIONS: { id: AudienceOption; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'public', label: 'Public', icon: <Globe size={14} />, desc: 'Visible to everyone' },
  { id: 'friends', label: 'Friends', icon: <UserCheck size={14} />, desc: 'People you follow' },
  { id: 'private', label: 'Only Me', icon: <Lock size={14} />, desc: 'Private to you' },
];

const CAPTION_LIMIT = 280;

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  onComplete,
  initialContent = '',
  initialType = 'story',
}) => {
  const [content, setContent] = useState(initialContent);
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [postType, setPostType] = useState<Post['postType']>(initialType);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isStartingLive, setIsStartingLive] = useState(false);
  const [location, setLocation] = useState('');
  const [tagPeople, setTagPeople] = useState('');
  const [audience, setAudience] = useState<AudienceOption>('public');
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
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
      console.error('Error accessing camera:', err);
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
      setTimeout(() => onComplete(), 2000);
    } else {
      onComplete();
    }
  };

  const addImage = () => {
    setMedia(prev => [...prev, {
      url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/600`,
      type: 'image',
    }]);
  };

  const addMultipleImages = () => {
    const newOnes: PostMedia[] = [1, 2, 3].map(() => ({
      url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/600`,
      type: 'image',
    }));
    setMedia(prev => [...prev, ...newOnes]);
  };

  const addVideo = () => {
    setMedia(prev => [...prev, {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-on-a-mountain-road-4536-large.mp4',
      type: 'video',
    }]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const isSlideDeck = media.filter(m => m.type === 'image').length > 1;
  const charsLeft = CAPTION_LIMIT - content.length;
  const isOverLimit = charsLeft < 0;
  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.id === audience)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-white">
          {isLiveMode ? 'Start Live Video' : postType === 'buddy_request' ? 'Find Travel Buddies' : 'Create Post'}
        </h2>
        <button onClick={onComplete} className="text-white/60 hover:text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <GlassCard
        className={`p-6 relative overflow-hidden transition-all duration-500 ${
          isLiveMode ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-white/30'
        }`}
      >
        {/* Post type tabs */}
        {!isLiveMode && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {(
              [
                { id: 'story' as const, label: 'Story', cls: 'bg-white text-slate-900 border-white', icon: null as React.ReactNode },
                { id: 'blog' as const, label: 'Guide', cls: 'bg-indigo-500 text-white border-indigo-500', icon: null as React.ReactNode },
                { id: 'buddy_request' as const, label: 'Buddy Request', cls: 'bg-purple-600 text-white border-purple-600', icon: <Users size={10} /> as React.ReactNode },
              ]
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setPostType(tab.id)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                  postType === tab.id ? tab.cls : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}

            {/* Audience picker */}
            <div className="ml-auto relative">
              <button
                onClick={() => setShowAudiencePicker(!showAudiencePicker)}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 transition-all"
              >
                {selectedAudience.icon} {selectedAudience.label}
              </button>
              {showAudiencePicker && (
                <div className="absolute right-0 top-full mt-2 w-48 z-30 animate-in slide-in-from-top-2 duration-200">
                  <GlassCard className="p-2 border-white/20 bg-slate-950/90 backdrop-blur-3xl shadow-2xl">
                    {AUDIENCE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setAudience(opt.id); setShowAudiencePicker(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          audience === opt.id ? 'bg-indigo-500/20 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-indigo-400">{opt.icon}</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">{opt.label}</p>
                          <p className="text-[8px] text-white/30 uppercase tracking-wider">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live preview */}
        {isLiveMode ? (
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black mb-6 border border-red-500/30">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <Radio size={12} /> PREVIEW
            </div>
          </div>
        ) : (
          <>
            {/* Caption textarea */}
            <div className="relative mb-2">
              <textarea
                placeholder={
                  postType === 'buddy_request'
                    ? "Tell people about your trip and what kind of travel buddy you're looking for..."
                    : 'Share a place, tip, or travel update...'
                }
                className="w-full bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none resize-none min-h-[120px]"
                value={content}
                maxLength={CAPTION_LIMIT + 50}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className={`absolute bottom-2 right-2 text-[9px] font-black uppercase tracking-widest transition-colors ${
                isOverLimit ? 'text-red-400' : charsLeft < 40 ? 'text-amber-400' : 'text-white/20'
              }`}>
                {charsLeft}
              </div>
            </div>

            {/* Location tag */}
            {showLocationInput && (
              <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                <MapPin size={16} className="text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add a location..."
                  className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none border-b border-white/10 pb-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setShowLocationInput(false); setLocation(''); }} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Tag people */}
            {showTagInput && (
              <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                <Users size={16} className="text-purple-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tag people (e.g. @elena, @marcus)..."
                  className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none border-b border-white/10 pb-1"
                  value={tagPeople}
                  onChange={(e) => setTagPeople(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setShowTagInput(false); setTagPeople(''); }} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Chips for location / tags */}
            {(location || tagPeople) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {location && (
                  <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-500/30">
                    <MapPin size={10} /> {location}
                  </span>
                )}
                {tagPeople && (
                  <span className="flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-purple-500/30">
                    <Users size={10} /> {tagPeople}
                  </span>
                )}
              </div>
            )}

            {/* Attached media */}
            {media.length > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between px-1">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    {isSlideDeck ? <><Sparkles size={12} className="text-blue-400" /> Photo Carousel</> : 'Attached Media'}
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
            <>
              {/* Media buttons */}
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

              {/* Tag & location row */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowLocationInput(!showLocationInput); setShowTagInput(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                    showLocationInput || location
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <MapPin size={12} /> {location || 'Location'}
                </button>
                <button
                  onClick={() => { setShowTagInput(!showTagInput); setShowLocationInput(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                    showTagInput || tagPeople
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Users size={12} /> {tagPeople ? `${tagPeople.split(',').length} tagged` : 'Tag People'}
                </button>
                <div className="ml-auto text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  {selectedAudience.icon}
                  <span>{selectedAudience.label}</span>
                </div>
              </div>
            </>
          )}

          {/* Submit row */}
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
              disabled={(!content && media.length === 0 && !isLiveMode) || isStartingLive || isOverLimit}
              className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all ${
                isLiveMode
                  ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : content || media.length > 0
                    ? 'bg-white text-slate-900 shadow-xl hover:scale-[1.02] active:scale-95'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {isStartingLive ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLiveMode ? (
                <><Radio size={20} className="animate-pulse" /> Start Live Video</>
              ) : (
                <><Send size={20} /> Share Post</>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
