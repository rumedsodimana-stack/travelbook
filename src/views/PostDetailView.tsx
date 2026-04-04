'use client';

import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Post, User } from '@/types';
import {
  ChevronLeft, MapPin, Heart, MessageCircle, Share2, ShieldCheck,
  Send, CheckCircle2, Users, Bookmark, UserPlus,
  UserCheck as UserCheckedIcon, Clock, ThumbsUp, MoreHorizontal
} from 'lucide-react';
import { PostMediaRenderer } from '@/components/PostMediaRenderer';
import { UserLabel } from '@/components/UserLabel';
import { useToast } from '@/components/ToastProvider';

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onProfileClick: (user: User) => void;
  onBookClick: (business: User) => void;
}

interface LocalComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isVerified?: boolean;
}

const MOCK_COMMENTS: LocalComment[] = [
  {
    id: 'c1',
    userName: 'Elena Gilbert',
    userAvatar: 'https://picsum.photos/seed/elena/200',
    text: 'This is absolutely breathtaking! I need to add this to my 2024 itinerary.',
    timestamp: '2h ago',
    isVerified: true
  },
  {
    id: 'c2',
    userName: 'Marcus Chen',
    userAvatar: 'https://picsum.photos/seed/marcus/200',
    text: 'How was the weather when you were there? Planning to visit next month.',
    timestamp: '1h ago'
  }
];

export const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack, onProfileClick, onBookClick }) => {
  const { showToast } = useToast();
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<LocalComment[]>(MOCK_COMMENTS);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(8200 + Math.floor(Math.random() * 100));

  const commentInputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      showToast("Post added to your favorites.", "success");
    }
  };

  const handleCommentClick = () => {
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentInputRef.current?.focus();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    showToast(isSaved ? "Removed from saved trips" : "Saved to your trip list", "info");
  };

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: LocalComment = {
      id: `c-${Date.now()}`,
      userName: 'Demo Traveler',
      userAvatar: 'https://picsum.photos/seed/demo-traveler/200',
      text: commentText,
      timestamp: 'Just now',
      isVerified: true
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    showToast("Comment posted.", "success");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Share link copied to clipboard.", "success");
  };

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    if (newFollowingState) {
      setFollowersCount(prev => prev + 1);
      showToast(`Now following ${post.author.name}`, "success");
    } else {
      setFollowersCount(prev => prev - 1);
      showToast(`Unfollowed ${post.author.name}`, "info");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-all font-bold uppercase tracking-widest text-xs group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
      </button>

      <GlassCard className="overflow-hidden border-white/30 mb-8">
        <div className="p-6">
          {/* Author Header Row */}
          <div
            className="flex items-center justify-between mb-8 cursor-pointer group/header hover:bg-white/5 p-4 rounded-3xl transition-all border border-transparent hover:border-white/10"
            onClick={() => onProfileClick(post.author)}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl group-hover/header:scale-105 group-hover/header:border-blue-500/50 transition-all duration-500">
                  <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                </div>
                {post.author.isBusiness && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border border-slate-900 shadow-xl">
                    <ShieldCheck size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                   <h3 className="font-bold text-white text-xl leading-none group-hover/header:text-blue-400 transition-colors">
                     {post.author.name}
                   </h3>
                   <UserLabel category={post.author.category} isBusiness={post.author.isBusiness} />
                   <button
                    onClick={handleFollowToggle}
                    className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest transition-all border shadow-lg flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-white text-slate-900 border-white hover:scale-105 active:scale-95'
                    }`}
                   >
                     {isFollowing ? <><UserCheckedIcon size={10} strokeWidth={3} /> Following</> : <><UserPlus size={10} strokeWidth={3} /> Follow</>}
                   </button>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{post.author.username}</p>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <p className="text-white font-black text-[10px] tracking-widest">
                    <span className="text-white/40 font-bold uppercase">Followers:</span> {formatNumber(followersCount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl text-white/20 group-hover/header:text-blue-400 group-hover/header:bg-blue-400/10 transition-all">
              <MoreHorizontal size={20} />
            </div>
          </div>

          <div className="space-y-4 mb-8 px-2">
             {post.location && (
              <div className="flex items-center gap-1.5 text-blue-400 text-sm font-bold">
                <MapPin size={18} />
                <span>{post.location}</span>
              </div>
            )}
            <h2 className="text-2xl font-black text-white leading-tight">
              {post.author.isBusiness
                ? 'Business Page Update'
                : post.postType === 'blog'
                  ? 'Traveler Guide & Experience'
                  : 'Travel Moment'}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              {post.content}
            </p>
          </div>

          <div className="mb-8 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            <PostMediaRenderer post={post} aspectRatio="aspect-auto min-h-[400px]" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-t border-white/10 pt-8 px-2">
              <div className="flex items-center gap-8">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2.5 group active:scale-90 transition-transform"
                >
                  <Heart
                    size={28}
                    className={`transition-all duration-300 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'}`}
                  />
                  <span className={`font-bold text-lg tracking-tighter ${isLiked ? 'text-red-500' : 'text-white'}`}>
                    {formatNumber(likesCount)}
                  </span>
                </button>
                <button
                  onClick={handleCommentClick}
                  className="flex items-center gap-2.5 group active:scale-90 transition-transform"
                >
                  <MessageCircle size={28} className="text-white group-hover:text-blue-400" />
                  <span className="text-white font-bold text-lg tracking-tighter group-hover:text-blue-400">{formatNumber(comments.length)}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="hover:scale-110 active:scale-90 transition-all"
                >
                  <Share2 size={28} className="text-white hover:text-emerald-400 transition-colors" />
                </button>
              </div>
              <button onClick={handleSave} className="hover:scale-110 active:scale-90 transition-all">
                <Bookmark
                  size={24}
                  className={`transition-all ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white/40 hover:text-white'}`}
                />
              </button>
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleSendComment}
              className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-indigo-500/50 transition-all mx-2"
            >
              <input
                ref={commentInputRef}
                type="text"
                placeholder="Write a comment..."
                className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder-white/20"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-20 hover:bg-indigo-500 transition-colors shadow-lg active:scale-95"
              >
                <Send size={18} />
              </button>
            </form>

            {/* Comments Ledger */}
            <div className="space-y-6 pt-6 px-2">
              <h4 className="text-white/30 text-[10px] uppercase font-black tracking-widest">Public Commentary Ledger</h4>
              {comments.map((comment, idx) => (
                <div key={comment.id} className="animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-4">
                    <img src={comment.userAvatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{comment.userName}</span>
                          {comment.isVerified && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest border border-emerald-500/20">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">{comment.timestamp}</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1.5 text-white/20 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest">
                          <ThumbsUp size={12} /> Helpful
                        </button>
                        <button className="text-white/20 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx < comments.length - 1 && <div className="h-px bg-white/5 mt-6" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
