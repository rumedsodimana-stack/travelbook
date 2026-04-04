'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  ChevronRight, X, Sparkles, Map,
  ShieldCheck, Send, Mountain, Bot
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  targetId?: string;
  icon: React.ReactNode;
  position: 'center' | 'bottom-nav' | 'top';
  navIndex?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Travel Book",
    description: "Your decentralized journey starts here. Explore, plan, and secure your travels on the global ledger.",
    icon: <Mountain className="text-white" size={32} />,
    position: 'center'
  },
  {
    title: "Global Discovery Feed",
    description: "Connect with over 1M travelers. See live streams, slideshow stories, and buddy requests from around the world.",
    icon: <Map className="text-blue-400" size={24} />,
    position: 'bottom-nav',
    navIndex: 0
  },
  {
    title: "AI Trip Planner",
    description: "The crown jewel. Generate personalized itineraries with real-time budget tracking and on-chain price verification.",
    icon: <Bot className="text-purple-400" size={24} />,
    position: 'bottom-nav',
    navIndex: 1
  },
  {
    title: "Share Your Story",
    description: "Post slideshows, start a live broadcast, or request travel partners for your next big adventure.",
    icon: <Send className="text-emerald-400" size={24} />,
    position: 'bottom-nav',
    navIndex: 2
  },
  {
    title: "Verified Bookings",
    description: "Manage your on-chain reservations. Secure flights, hotels, and dining with blockchain-backed reliability.",
    icon: <ShieldCheck className="text-indigo-400" size={24} />,
    position: 'bottom-nav',
    navIndex: 3
  },
  {
    title: "Digital Identity",
    description: "Manage your passport, reputation, and even launch your own provider business page.",
    icon: <Sparkles className="text-amber-400" size={24} />,
    position: 'bottom-nav',
    navIndex: 4
  }
];

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Target Highlight for Bottom Nav Items */}
      {step.position === 'bottom-nav' && step.navIndex !== undefined && (
        <div
          className="fixed bottom-[34px] z-[1001] w-12 h-12 rounded-full border-2 border-white animate-ping opacity-20 transition-all duration-500"
          style={{
            left: `calc(50% + ${(step.navIndex - 2) * (100 / 5)}% - 24px)`,
            transform: 'translateX(-50%)'
          }}
        />
      )}

      <GlassCard className={`relative w-[90%] max-w-sm overflow-hidden border-white/30 shadow-[0_0_100px_rgba(255,255,255,0.1)] transition-all duration-500 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-white/10 rounded-2xl shadow-inner">
              {step.icon}
            </div>
            <button onClick={handleClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="text-white font-black text-2xl tracking-tight leading-tight">{step.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-white' : 'w-2 bg-white/20'}`} />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next Step"} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 pointer-events-none">
         <div className="flex flex-col items-center gap-2 opacity-40 animate-bounce">
            <div className="w-1 h-8 bg-gradient-to-t from-white to-transparent rounded-full" />
         </div>
      </div>
    </div>
  );
};
