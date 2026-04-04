'use client';
import React from 'react';
import { Briefcase, Compass, Home, PlusSquare, Ticket, User } from 'lucide-react';
import { AppRoute } from '@/types';

interface BottomNavProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, setRoute }) => {
  const navItems = [
    { id: AppRoute.HOME, icon: Home, label: 'Home' },
    { id: AppRoute.SEARCH, icon: Compass, label: 'Explore' },
    { id: AppRoute.GAMES, icon: Briefcase, label: 'Providers' },
    { id: AppRoute.POST, icon: PlusSquare, label: 'Share' },
    { id: AppRoute.BOOKINGS, icon: Ticket, label: 'Trips' },
    { id: AppRoute.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
      <div className="mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[2rem] border border-white/10 bg-[#0a1d26]/90 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button key={item.id} onClick={() => setRoute(item.id)}
              className={`flex flex-col items-center gap-1 rounded-[1.4rem] px-3 py-3 text-center transition-all ${
                isActive ? 'bg-amber-300 text-slate-950' : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
