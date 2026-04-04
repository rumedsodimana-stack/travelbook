'use client';

import React, { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  MapPin, Send, X, Users, Video, Play, Radio,
  Loader2, Sparkles, Image as ImageIcon, Plus, Lock,
  Globe, UserCheck, UploadCloud, Film
} from 'lucide-react';
import { Post, PostMedia } from '@/types';

interface CreatePostViewProps {
  onComplete: () => void;
  initialContent?: string;
  initialType?: Post['postType'];
}

type AudienceOption = 'public' | 'friends' | 'private';

const AUDIENCE_OPTIONS: { id: AudienceOption; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'public',  label: 'Public',   icon: <Globe size={14} />,     desc: 'Visible to everyone'  },
  { id: 'friends', label: 'Friends',  icon: <UserCheck size={14} />, desc: 'People you follow'    },
  { id: 'private', label: 'Only Me',  icon: <Lock size={14} />,      desc: 'Private to you'       },
];

const POST_TYPES = [
  { id: 'story'         as const, label: 'Story',         cls: 'bg-white text-slate-900 border-white',           icon: null        as React.ReactNode },
  { id: 'blog'          as const, label: 'Guide',         cls: 'bg-indigo-500 text-white border-indigo-500',      icon: null        as React.ReactNode },
  { id: 'buddy_request' as const, label: 'Buddy Request', cls: 'bg-purple-600 text-white border-purple-600',      icon: <Users size={10} /> as React.ReactNode },
];

const CAPTION_LIMIT = 280;

// Simulate "uploading" a dropped file by mapping it to a deterministic picsum seed
const fileToMockMedia = (file: File): PostMedia => {
  const seed = file.name.replace(/\W/g, '').slice(0, 12) || Math.random().toString(36).slice(2, 10);
  if (file.type.startsWith('video/')) {
    return { url: 'https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-on-a-mountain-road-4536-large.mp4', type: 'video' };
  }
  return { url: `https://picsum.photos/seed/${seed}/800/600`, type: 'image' };
};

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  onComplete,
  initialContent = '',
  initialType = 'story',
}) => {
  const [content, setContent]                   = useState(initialContent);
  const [media, setMedia]                       = useState<PostMedia[]>([]);
  const [postType, setPostType]                 = useState<Post['postType']>(initialType);
  const [isLiveMode, setIsLiveMode]             = useState(false);
  const [isStartingLive, setIsStartingLive]     = useState(false);
  const [location, setLocation]                 = useState('');
  const [tagPeople, setTagPeople]               = useState('');
  const [audience, setAudience]                 = useState<AudienceOption>('public');
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showLocationInput, setShowLocationInput]   = useState(false);
  const [showTagInput, setShowTagInput]             = useState(false);
  const [isDraggingOver, setIsDraggingOver]         = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialContent) setContent(initialContent);
    if (initialType)    setPostType(initialType);
  }, [initialContent, initialType]);

  // Camera preview for live mode
  useEffect(() => {
    if (isLiveMode) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error('Camera error:', err));
    } else {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
    }
  }, [isLiveMode]);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length) {
      setMedia(prev => [...prev, ...files.map(fileToMockMedia)]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setMedia(prev => [...prev, ...files.map(fileToMockMedia)]);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  // ── Quick-add helpers ─────────────────────────────────────────────────────
  const addImage = () =>
    setMedia(prev => [...prev, { url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/600`, type: 'image' }]);

  const addGallery = () =>
    setMedia(prev => [...prev, ...[1, 2, 3].map(() => ({ url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/600`, type: 'image' as const }))]);

  const addVideo = () =>
    setMedia(prev => [...prev, { url: 'https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-on-a-mountain-road-4536-large.mp4', type: 'video' }]);

  const removeMedia = (index: number) => setMedia(prev => prev.filter((_, i) => i !== index));

  // ── Derived state ─────────────────────────────────────────────────────────
  const isSlideDeck      = media.filter(m => m.type === 'image').length > 1;
  const charsLeft        = CAPTION_LIMIT - content.length;
  const isOverLimit      = charsLeft < 0;
  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.id === audience)!;
  const canPost          = (content.trim() || media.length > 0 || isLiveMode) && !isOverLimit;

  const handlePost = () => {
    if (isLiveMode) {
      setIsStartingLive(true);
      setTimeout(onComplete, 2000);
    } else {
      onComplete();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-white">
          {isLiveMode
            ? 'Start Live Video'
            : postType === 'buddy_request'
              ? 'Find Travel Buddies'
              : 'Create Post'}
        </h2>
        <button onClick={onComplete} className="text-white/60 hover:text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <GlassCard
        className={`p-6 relative overflow-hidden transition-all duration-500 ${
          isLiveMode
            ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
            : isDraggingOver
              ? 'border-indigo-400/80 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
              : 'border-white/30'
        }`}
      >
        {/* ── Post type + audience row ── */}
        {!isLiveMode && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {POST_TYPES.map(tab => (
              <button
                key={tab.id}
                onClick={() => setPostType(tab.id)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                  postType === tab.id ? tab.cls : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}

            {/* Audience picker */}
            <div className="ml-auto relative">
              <button
                onClick={() => setShowAudiencePicker(p => !p)}
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

        {/* ── Live camera preview ── */}
        {isLiveMode ? (
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black mb-6 border border-red-500/30">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <Radio size={12} /> PREVIEW
            </div>
          </div>
        ) : (
          <>
            {/* ── Caption ── */}
            <div className="relative mb-4">
              <textarea
                placeholder={
                  postType === 'buddy_request'
                    ? "Tell people about your trip and what kind of travel buddy you're looking for..."
                    : 'Share a place, tip, or travel update...'
                }
                className="w-full bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none resize-none min-h-[100px]"
                value={content}
                maxLength={CAPTION_LIMIT + 50}
                onChange={e => setContent(e.target.value)}
              />
              {/* Character counter */}
              <div className={`absolute bottom-1 right-1 text-[9px] font-black tracking-widest transition-colors ${
                isOverLimit ? 'text-red-400' : charsLeft < 40 ? 'text-amber-400' : 'text-white/20'
              }`}>
                {charsLeft}
              </div>
            </div>

            {/* ── Drag-and-drop dropzone (shown when no media yet) ── */}
            {media.length === 0 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInput.current?.click()}
                className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer mb-6 flex flex-col items-center justify-center gap-4 py-12 group ${
                  isDraggingOver
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className={`p-5 rounded-3xl transition-all duration-300 ${
                  isDraggingOver ? 'bg-indigo-500/20 scale-110' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <UploadCloud
                    size={40}
                    className={`transition-colors duration-300 ${isDraggingOver ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60'}`}
                  />
                </div>

                <div className="text-center px-4">
                  <p className={`font-black text-sm uppercase tracking-widest transition-colors ${
                    isDraggingOver ? 'text-indigo-300' : 'text-white/50 group-hover:text-white/80'
                  }`}>
                    {isDraggingOver ? 'Drop to add media' : 'Drag & drop photos or videos'}
                  </p>
                  <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mt-1">
                    or click to browse · JPG, PNG, MP4, MOV
                  </p>
                </div>

                {/* Quick-add pills inside the zone */}
                {!isDraggingOver && (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={addImage}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      <ImageIcon size={12} /> Photo
                    </button>
                    <button
                      onClick={addGallery}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400/70 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                    >
                      <Sparkles size={12} /> Gallery
                    </button>
                    <button
                      onClick={addVideo}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Film size={12} /> Video
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Media thumbnails (shown after files are added) ── */}
            {media.length > 0 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`space-y-3 mb-6 p-3 rounded-3xl border-2 border-dashed transition-all duration-200 ${
                  isDraggingOver ? 'border-indigo-400/60 bg-indigo-500/5' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    {isSlideDeck
                      ? <><Sparkles size={12} className="text-blue-400" /> Photo Carousel</>
                      : 'Attached Media'}
                  </p>
                  <span className="text-white/30 text-[9px] font-black">{media.length} item{media.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {media.map((m, idx) => (
                    <div
                      key={idx}
                      className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/20 group shadow-xl"
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="relative w-full h-full bg-slate-800">
                          <video src={m.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play size={20} className="text-white fill-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-2 text-[8px] font-black text-white/50">
                        {m.type === 'video' ? <Film size={10} className="inline" /> : `#${idx + 1}`}
                      </div>
                    </div>
                  ))}
                  {/* Add-more tile */}
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="w-28 h-28 shrink-0 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/60 hover:border-white/30 transition-all"
                  >
                    <Plus size={22} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Add more</span>
                  </button>
                </div>
                <p className="text-white/15 text-[8px] font-black uppercase tracking-widest px-1">
                  Drop more files here to add them
                </p>
              </div>
            )}

            {/* ── Location + Tag people + audience summary ── */}
            {showLocationInput && (
              <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                <MapPin size={15} className="text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add a location..."
                  className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none border-b border-white/10 pb-1"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setShowLocationInput(false); setLocation(''); }} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {showTagInput && (
              <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                <Users size={15} className="text-purple-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tag people (e.g. @elena, @marcus)..."
                  className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none border-b border-white/10 pb-1"
                  value={tagPeople}
                  onChange={e => setTagPeople(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setShowTagInput(false); setTagPeople(''); }} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Active chips */}
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
          </>
        )}

        {/* ── Footer toolbar ── */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
          {!isLiveMode && (
            <>
              {/* Toolbar row: media shortcuts + go-live */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="bg-white/10 border border-white/10 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/20 transition-all text-white/70"
                >
                  <ImageIcon size={20} />
                  <span className="text-[7px] font-black uppercase tracking-widest">Photo</span>
                </button>
                <button
                  onClick={addGallery}
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

              {/* Location / tag / audience row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setShowLocationInput(p => !p); setShowTagInput(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                    showLocationInput || location
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <MapPin size={12} /> {location || 'Location'}
                </button>
                <button
                  onClick={() => { setShowTagInput(p => !p); setShowLocationInput(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                    showTagInput || tagPeople
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Users size={12} />
                  {tagPeople ? `${tagPeople.split(',').filter(Boolean).length} tagged` : 'Tag People'}
                </button>
                <div className="ml-auto flex items-center gap-1.5 text-white/25 text-[9px] font-black uppercase tracking-widest">
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
              disabled={!canPost || isStartingLive}
              className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all ${
                isLiveMode
                  ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : canPost
                    ? 'bg-white text-slate-900 shadow-xl hover:scale-[1.02] active:scale-95'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {isStartingLive
                ? <Loader2 className="animate-spin" size={20} />
                : isLiveMode
                  ? <><Radio size={20} className="animate-pulse" /> Start Live Video</>
                  : <><Send size={20} /> Share Post</>
              }
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
