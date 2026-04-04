'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  User, Shield, Bell, Moon, Languages, HelpCircle,
  LogOut, ChevronRight, CreditCard, Lock, Eye, Zap,
  Wallet, Database, HardDrive, ArrowUpRight, Copy,
  CheckCircle2, RefreshCw, Smartphone, Globe, ShieldCheck,
  TrendingUp, Download, History, Terminal
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface SettingsViewProps {
  onLogout: () => void;
  onAdminPortal?: () => void;
  onProfileEdit?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, onAdminPortal, onProfileEdit }) => {
  const { showToast } = useToast();
  const [lowLatency, setLowLatency] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [walletBalance, setWalletBalance] = useState(1240.50);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const walletAddress = 'TB-BILL-2048';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('TB-BILL-2048');
    showToast('Billing ID copied to clipboard!', 'success');
  };

  const handleRefreshBalances = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setWalletBalance(prev => prev + Math.random() * 5);
      setIsRefreshing(false);
      showToast('Payment summary refreshed.', 'info');
    }, 1500);
  };

  const toggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, label: string) => {
    setter(prev => {
      const newState = !prev;
      showToast(`${label} ${newState ? 'enabled' : 'disabled'}`, "info");
      return newState;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Settings</h2>
        <p className="text-white/40 text-sm mt-1">Manage your account, privacy, payments, and app preferences.</p>
      </div>

      {/* Admin Quick Entry - Only for verified admins */}
      {onAdminPortal && (
        <button
          onClick={onAdminPortal}
          className="w-full p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-[2rem] flex items-center justify-between group hover:bg-indigo-600/20 transition-all shadow-2xl shadow-indigo-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
              <Terminal size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Admin</h3>
              <p className="text-white font-bold text-lg leading-tight">Admin Tools</p>
              <p className="text-white/40 text-[9px] mt-1">Manage moderation, AI tools, and advanced controls</p>
            </div>
          </div>
          <ArrowUpRight size={24} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      <GlassCard className="p-8 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Wallet size={120} className="text-indigo-400 rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                <Wallet className="text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs">Payments</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                    <CheckCircle2 size={12} /> Ready
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <button onClick={handleCopyAddress} className="text-white/40 text-[10px] font-mono hover:text-white transition-all flex items-center gap-1">
                    {walletAddress} <Copy size={10} />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefreshBalances}
              className={`p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
              <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Trip Budget</p>
              <p className="text-white font-black text-lg tracking-tighter">{walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
              <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Default Method</p>
              <p className="text-white font-black text-lg tracking-tighter">Visa 4242</p>
            </div>
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
              <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Payouts</p>
              <p className="text-white font-black text-lg tracking-tighter">Available</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <TrendingUp size={14} /> Payment Methods
            </button>
            <button className="flex-1 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <History size={14} /> Billing History
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h3 className="text-white/30 text-[10px] uppercase font-black tracking-widest ml-4">Account</h3>
        <GlassCard className="overflow-hidden border-white/10">
          <button onClick={onProfileEdit} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Edit Profile</p>
                <p className="text-white/40 text-[10px] mt-0.5">Change your name, bio, and travel style</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>

          <button onClick={() => showToast("Identity credentials are up to date.", "success")} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">Verified Account</p>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Active</span>
                </div>
                <p className="text-white/40 text-[10px] mt-0.5">Your account is confirmed and ready to use</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>

          <button onClick={() => showToast("Payment history is up to date.", "info")} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Payments</p>
                <p className="text-white/40 text-[10px] mt-0.5">View receipts and payment activity</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-white/30 text-[10px] uppercase font-black tracking-widest ml-4">Preferences</h3>
        <GlassCard className="overflow-hidden border-white/10">
          <div className="w-full flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors ${lowLatency ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/40'}`}>
                <Zap size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Data Saver</p>
                <p className="text-white/40 text-[10px] mt-0.5">Use less data when browsing on mobile</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting(setLowLatency, "Data Saver")}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${lowLatency ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${lowLatency ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="w-full flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors ${isPrivate ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40'}`}>
                <Eye size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Private Profile</p>
                <p className="text-white/40 text-[10px] mt-0.5">Hide parts of your profile from other travelers</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting(setIsPrivate, "Private Profile")}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isPrivate ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isPrivate ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="w-full flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors ${offlineSync ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                <HardDrive size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Offline Access</p>
                <p className="text-white/40 text-[10px] mt-0.5">Keep important trip details available offline</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting(setOfflineSync, "Offline Access")}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${offlineSync ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${offlineSync ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => showToast("Preparing your travel data export...", "info")}
          className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between gap-3 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Download size={20} className="text-blue-400" />
            Export My Travel Data
          </div>
          <ArrowUpRight size={18} className="text-white/20 group-hover:text-white transition-all" />
        </button>

        <button
          onClick={onLogout}
          className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-xl"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>

      <div className="text-center pt-8 pb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Globe size={16} className="text-white/20" />
          <Smartphone size={16} className="text-white/20" />
          <Lock size={16} className="text-white/20" />
        </div>
        <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em]">Travel Book</p>
        <p className="text-white/10 text-[7px] font-mono mt-1">Private and secure on this device</p>
      </div>
    </div>
  );
};
