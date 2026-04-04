'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Notification } from '@/types';
import {
  Heart, MessageCircle, UserPlus, Users, Bell, ShieldCheck,
  Check, Trash2, X
} from 'lucide-react';

type TabKey = 'all' | 'like' | 'comment' | 'follow' | 'buddy_request' | 'system';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'like', label: 'Likes' },
  { id: 'comment', label: 'Comments' },
  { id: 'follow', label: 'Follows' },
  { id: 'buddy_request', label: 'Buddy' },
  { id: 'system', label: 'Bookings' },
];

const MOCK_NOTIFS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    userName: 'Elena Gilbert',
    userAvatar: 'https://picsum.photos/seed/elena/200',
    message: 'liked your journey in Kyoto',
    timestamp: '2m ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'buddy_request',
    userName: 'Marcus Chen',
    userAvatar: 'https://picsum.photos/seed/marcus/200',
    message: 'sent you a Travel Buddy request for Bali',
    timestamp: '15m ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'system',
    message: 'Your hotel booking for Santorini is confirmed',
    timestamp: '1h ago',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'comment',
    userName: 'Sarah Blake',
    userAvatar: 'https://picsum.photos/seed/sarah/200',
    message: 'commented: "This view is incredible! Adding to my list."',
    timestamp: '3h ago',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'follow',
    userName: 'Riku Sato',
    userAvatar: 'https://picsum.photos/seed/riku-sato/200',
    message: 'started following you',
    timestamp: '5h ago',
    isRead: false,
  },
  {
    id: 'n6',
    type: 'like',
    userName: 'Mei Lin',
    userAvatar: 'https://picsum.photos/seed/mei-lin/200',
    message: 'liked your photo from Zermatt',
    timestamp: '6h ago',
    isRead: true,
  },
  {
    id: 'n7',
    type: 'system',
    message: 'Flight booking FLT-8842 is now confirmed. Check-in opens 24h before departure.',
    timestamp: '8h ago',
    isRead: true,
  },
  {
    id: 'n8',
    type: 'comment',
    userName: 'James Thornton',
    userAvatar: 'https://picsum.photos/seed/james-t/200',
    message: 'replied to your comment: "Totally agree — it\'s unmissable."',
    timestamp: '10h ago',
    isRead: true,
  },
  {
    id: 'n9',
    type: 'follow',
    userName: 'Grand Zermatt Hotel',
    userAvatar: 'https://picsum.photos/seed/zermatt-hotel/200',
    message: 'is now following your travel updates',
    timestamp: '1d ago',
    isRead: true,
  },
  {
    id: 'n10',
    type: 'buddy_request',
    userName: 'Aria Nomad',
    userAvatar: 'https://picsum.photos/seed/aria-solo/200',
    message: 'wants to join your upcoming Marrakesh trip',
    timestamp: '1d ago',
    isRead: false,
  },
];

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFS);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredNotifs = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500 fill-red-500" size={16} />;
      case 'comment': return <MessageCircle className="text-blue-400" size={16} />;
      case 'buddy_request': return <Users className="text-purple-400" size={16} />;
      case 'follow': return <UserPlus className="text-emerald-400" size={16} />;
      case 'system': return <ShieldCheck className="text-indigo-400" size={16} />;
      default: return <Bell className="text-white/40" size={16} />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 py-6 gap-4">
      {/* Header — pinned */}
      <div className="flex-shrink-0 flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Activity</h2>
          <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} · likes, messages, and booking updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Check size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-red-400 transition-colors"
            >
              <X size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Tabs — pinned */}
      <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((tab) => {
          const tabCount = tab.id === 'all'
            ? notifications.filter(n => !n.isRead).length
            : notifications.filter(n => n.type === tab.id && !n.isRead).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 border-white shadow-xl'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
              {tabCount > 0 && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-indigo-500/30 text-indigo-300'
                }`}>
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List — scrolls internally */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {filteredNotifs.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Bell className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-white/40 font-bold">No activity here yet.</p>
          </GlassCard>
        ) : (
          filteredNotifs.map((notif) => (
            <GlassCard
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-5 transition-all duration-300 hover:border-white/30 group cursor-pointer ${
                !notif.isRead
                  ? 'bg-white/15 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar or system icon */}
                <div className="relative shrink-0">
                  {notif.userAvatar ? (
                    <img src={notif.userAvatar} className="w-12 h-12 rounded-2xl object-cover border border-white/20" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                      <Bell className="text-indigo-400" size={20} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 rounded-lg border border-white/10 shadow-xl">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm leading-snug">
                    {notif.userName && <span className="font-black text-white mr-1.5">{notif.userName}</span>}
                    {notif.message}
                  </p>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1.5">
                    {notif.timestamp}
                    {!notif.isRead && (
                      <span className="ml-3 inline-flex items-center gap-1 text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                        New
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                      className="p-2 text-indigo-400 hover:text-white transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
