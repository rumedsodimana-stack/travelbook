'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  PROVIDER_CATEGORY_BY_TYPE,
  PROVIDER_TYPE_OPTIONS,
  SUPPLIER_CATEGORY_BY_TYPE,
  SUPPLIER_TYPE_OPTIONS,
  TRAVELER_STYLE_OPTIONS,
} from '@/config/onboarding';
import { User, Review, Post } from '@/types';
import {
  LogOut, Settings, Award, Map, Camera, Briefcase,
  ChevronRight, UserPlus, Users, Calendar, MessageSquare,
  ShieldCheck, CheckCircle2, Star, Coffee, Bed, Send, Clock,
  TrendingUp, BarChart3, Filter, ThumbsUp, AlertCircle, Bot,
  Grid, Image as ImageIcon, MapPin, Zap, Rocket, Ticket,
  Edit3, Save, X, Loader2
} from 'lucide-react';
import { summarizeReviews } from '@/services/geminiService';
import { MembershipBadge } from '@/components/MembershipBadge';
import { ProviderPagePanel } from '@/components/ProviderPagePanel';
import { UserLabel } from '@/components/UserLabel';
import { PostMediaRenderer } from '@/components/PostMediaRenderer';
import { useToast } from '@/components/ToastProvider';
import {
  getMembershipLabel,
  resolveIdentityKind,
  resolveIdentityLabel,
  resolveMembershipTier,
} from '@/services/identityService';

interface ProfileViewProps {
  user: User;
  posts: Post[];
  onLogout: () => void;
  onBusiness: () => void;
  onBookClick?: (business: User) => void;
  onPostClick?: (post: Post) => void;
  onSendMessage?: (user: User) => void;
  onUpdateProfile?: (user: User) => void;
  isOwnProfile?: boolean;
}

type ProfileTab = 'journeys' | 'media' | 'reviews';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u2',
    userName: 'Elena Gilbert',
    userAvatar: 'https://picsum.photos/seed/elena/200',
    rating: 5,
    text: 'Absolutely incredible service. The staff went above and beyond to make our stay memorable.',
    timestamp: '2 days ago'
  }
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  onLogout,
  onBusiness,
  onBookClick,
  onPostClick,
  onSendMessage,
  onUpdateProfile,
  isOwnProfile = false
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTab>('journeys');
  const [isFollowed, setIsFollowed] = useState(false);
  const [isBuddyRequested, setIsBuddyRequested] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio || '',
    category: user.category || 'Traveler'
  });

  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const membershipTier = resolveMembershipTier(user);
  const identityKind = resolveIdentityKind(user);
  const identityLabel = resolveIdentityLabel(user);

  const profileCategoryOptions = useMemo(() => {
    if (user.accountType === 'provider') {
      return PROVIDER_TYPE_OPTIONS.map((option) => PROVIDER_CATEGORY_BY_TYPE[option.id]);
    }

    if (user.accountType === 'supplier') {
      return SUPPLIER_TYPE_OPTIONS.map((option) => SUPPLIER_CATEGORY_BY_TYPE[option.id]);
    }

    return TRAVELER_STYLE_OPTIONS;
  }, [user.accountType]);

  const profileCategoryLabel =
    user.accountType === 'provider'
      ? 'Provider Type'
      : user.accountType === 'supplier'
        ? 'Supplier Type'
        : 'Travel Style';

  const userPosts = useMemo(() => posts.filter(p => p.userId === user.id), [posts, user.id]);
  const userMedia = useMemo(() => {
    const media: string[] = [];
    userPosts.forEach(p => {
      if (p.imageUrl) media.push(p.imageUrl);
      if (p.mediaList) p.mediaList.forEach(m => media.push(m.url));
    });
    return media;
  }, [userPosts]);

  useEffect(() => {
    if (user.isBusiness && reviews.length > 0) {
      summarizeReviews(reviews).then(summary => setAiSummary(summary || null));
    }
  }, [user.id, user.isBusiness]);

  const handleAdvertise = () => {
    showToast(`Your ${identityKind} is being promoted to more travelers.`, 'success');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    if (onUpdateProfile) {
      onUpdateProfile({
        ...user,
        name: editForm.name,
        bio: editForm.bio,
        category: editForm.category
      });
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  const isProfessional = user.isBusiness || user.category?.includes('Guide') || user.category?.includes('Planner');

  const handleMembershipUpgrade = (nextTier: 'premium' | 'gold') => {
    if (!onUpdateProfile || membershipTier === nextTier) {
      return;
    }

    onUpdateProfile({
      ...user,
      membershipTier: nextTier,
    });

    showToast(
      nextTier === 'gold'
        ? `Your ${identityKind} now has a gold badge.`
        : `Your ${identityKind} now has a blue badge.`,
      'success',
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <GlassCard className="p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:bg-white/10"
          >
            <Edit3 size={20} />
          </button>
        )}

        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/20 overflow-hidden shadow-2xl relative group p-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20" />
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[2.2rem]" />
          </div>
          {isProfessional && (
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-2xl p-2 border-4 border-slate-950 shadow-xl">
              <Zap size={20} className="text-white" />
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="w-full space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-white/40 text-[9px] uppercase font-black tracking-widest block text-left ml-2">Display Name</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/40 text-[9px] uppercase font-black tracking-widest block text-left ml-2">{profileCategoryLabel}</label>

              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
              >
                {profileCategoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/40 text-[9px] uppercase font-black tracking-widest block text-left ml-2">Bio</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[100px]"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : identityKind === 'page' ? 'Save Page' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black text-white tracking-tighter">{user.name}</h2>
                <MembershipBadge tier={membershipTier} />
                <UserLabel category={user.category} isBusiness={user.isBusiness} className="scale-110" />
              </div>
              <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">{user.username}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {identityLabel}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {getMembershipLabel(membershipTier)}
                </span>
                {user.locationBase && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    {user.locationBase}
                  </span>
                )}
              </div>
              {user.bio && (
                <p className="mt-4 text-white/60 text-sm max-w-xs leading-relaxed italic">"{user.bio}"</p>
              )}
            </div>

            <div className="flex gap-4 mb-8 w-full">
              <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-white font-black text-2xl tracking-tighter">{userPosts.length}</p>
                <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mt-1">Posts</p>
              </div>
              <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-white font-black text-2xl tracking-tighter">{user.isBusiness ? '42.1k' : '1.2k'}</p>
                <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mt-1">Followers</p>
              </div>
            </div>

            <div className="w-full space-y-4">
              {isOwnProfile && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Membership</p>
                      <div className="mt-2 flex items-center gap-2">
                        <MembershipBadge tier={membershipTier} showStandard />
                        <span className="text-sm font-semibold text-white">
                          {identityKind === 'page' ? 'Page trust tier' : 'Profile trust tier'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">
                        Premium adds a blue badge. Gold adds a gold badge and stronger trust across search, pages, and discovery.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleMembershipUpgrade('premium')}
                        disabled={membershipTier === 'premium' || membershipTier === 'gold'}
                        className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-sky-100 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Go Premium
                      </button>
                      <button
                        onClick={() => handleMembershipUpgrade('gold')}
                        disabled={membershipTier === 'gold'}
                        className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Go Gold
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isOwnProfile ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAdvertise}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-xl border border-indigo-400/30"
                  >
                    <Rocket size={18} /> {identityKind === 'page' ? 'Promote Page' : 'Promote'}
                  </button>
                  <button onClick={onBusiness} className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 p-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
                    <Briefcase size={18} /> {identityKind === 'page' ? 'Page Tools' : 'Tools'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {user.category?.includes('Event') ? (
                    <button
                      onClick={() => onBookClick?.(user)}
                      className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Ticket size={18} /> Get Tickets
                    </button>
                  ) : user.isBusiness ? (
                    <button
                      onClick={() => onBookClick?.(user)}
                      className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Calendar size={18} /> Book Now
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setIsFollowed(!isFollowed)} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${isFollowed ? 'bg-white/20 text-white' : 'bg-white text-slate-900'}`}><UserPlus size={16} /> {isFollowed ? 'Following' : 'Follow'}</button>
                      <button onClick={() => setIsBuddyRequested(!isBuddyRequested)} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${isBuddyRequested ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}><Users size={16} /> {isBuddyRequested ? 'Requested' : 'Travel Buddy'}</button>
                    </div>
                  )}
                  <button onClick={() => onSendMessage?.(user)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"><MessageSquare size={16} /> Message</button>
                </div>
              )}
            </div>

            {aiSummary && user.isBusiness && (
              <div className="mt-6 w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Quick Review Summary</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{aiSummary}</p>
              </div>
            )}
          </>
        )}
      </GlassCard>

      <ProviderPagePanel
        user={user}
        isOwnProfile={isOwnProfile}
        onUpdateProfile={onUpdateProfile}
        onBookClick={onBookClick}
      />

      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl sticky top-2 z-30 backdrop-blur-3xl">
        {['journeys', 'media', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as ProfileTab)}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-950 shadow-xl' : 'text-white/40 hover:text-white'}`}
          >
            {tab === 'journeys' ? 'Posts' : tab === 'media' ? 'Photos' : 'Reviews'}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'journeys' && (
          <div className="space-y-6">
            {userPosts.map(post => (
              <GlassCard key={post.id} className="overflow-hidden border-white/10 cursor-pointer group" onClick={() => onPostClick?.(post)}>
                <PostMediaRenderer post={post} aspectRatio="aspect-video" />
                <div className="p-5">
                  <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
                </div>
              </GlassCard>
            ))}
            {userPosts.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <ImageIcon className="mx-auto mb-4" size={48} />
                <p className="text-white font-black uppercase tracking-widest text-[10px]">No posts yet</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-2">
            {userMedia.map((url, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10"><img src={url} className="w-full h-full object-cover" alt="" /></div>
            ))}
            {userMedia.length === 0 && (
              <div className="col-span-3 py-20 text-center opacity-20">
                <Camera className="mx-auto mb-4" size={48} />
                <p className="text-white font-black uppercase tracking-widest text-[10px]">No photos yet</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'reviews' && (
           <div className="space-y-4">
              {reviews.map(review => (
                <GlassCard key={review.id} className="p-6 border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <img src={review.userAvatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                         <p className="text-white font-bold text-sm">{review.userName}</p>
                         <p className="text-white/40 text-[9px] uppercase font-black">{review.timestamp}</p>
                      </div>
                   </div>
                   <p className="text-white/80 text-sm leading-relaxed mb-4">"{review.text}"</p>
                   <div className="flex gap-1 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                   </div>
                </GlassCard>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};
