'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Notification } from '@/types';
import { Heart, MessageCircle, UserPlus, Users, Bell, ShieldCheck, Check, Trash2 } from 'lucide-react';

const MOCK_NOTIFS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    userName: 'Elena Gilbert',
    userAvatar: 'https://picsum.photos/seed/elena/200',
    message: 'liked your journey in Kyoto',
    timestamp: '2m ago',
    isRead: false
  },
  {
    id: 'n2',
    type: 'buddy_request',
    userName: 'Marcus Chen',
    userAvatar: 'https://picsum.photos/seed/marcus/200',
    message: 'sent you a Travel Buddy request for Bali',
    timestamp: '15m ago',
    isRead: false
  },
  {
    id: 'n3',
    type: 'system',
    message: 'Your hotel booking for Santorini is confirmed',
    timestamp: '1h ago',
    isRead: true
  },
  {
    id: 'n4',
    type: 'comment',
    userName: 'Sarah Blake',
    userAvatar: 'https://picsum.photos/seed/sarah/200',
    message: 'commented: "This view is incredible! Adding to my list."',
    timestamp: '3h ago',
    isRead: true
  }
];

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFS);

  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'like': return <Heart className="text-red-500 fill-red-500" size={16} />;
      case 'comment': return <MessageCircle className="text-blue-400" size={16} />;
      case 'buddy_request': return <Users className="text-purple-400" size={16} />;
      case 'follow': return <UserPlus className="text-emerald-400" size={16} />;
      case 'system': return <ShieldCheck className="text-indigo-400" size={16} />;
      default: return <Bell className="text-white/40" size={16} />;
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Activity</h2>
          <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Recent likes, messages, and booking updates</p>
        </div>
        <button
          onClick={markAllRead}
          className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Check size={14} /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Bell className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-white/40 font-bold">No new activity to report.</p>
          </GlassCard>
        ) : (
          notifications.map((notif, idx) => (
            <GlassCard
              key={notif.id}
              className={`p-5 transition-all duration-300 border-white/10 hover:border-white/30 group ${!notif.isRead ? 'bg-white/15 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''}`}
            >
              <div className="flex items-start gap-4">
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

                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm leading-snug">
                    {notif.userName && <span className="font-black text-white mr-1.5">{notif.userName}</span>}
                    {notif.message}
                  </p>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1.5">{notif.timestamp}</p>
                </div>

                <button
                  onClick={() => deleteNotif(notif.id)}
                  className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
