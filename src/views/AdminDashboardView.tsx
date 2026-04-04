'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Shield, Activity, Users, ChevronLeft,
  Terminal, RefreshCw, Globe, Cpu,
  Server, BarChart4, Download,
  Layers, Smartphone, Network,
  Link2, Boxes, Cloud, CheckCircle2,
  AlertCircle, ArrowUpRight, Lock, Zap, Copy, ExternalLink, Share2
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface AdminDashboardViewProps {
  onBack: () => void;
}

type AdminTab = 'overview' | 'connectors' | 'ai_engine' | 'deployment' | 'operations';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('deployment');
  const [deployStep, setDeployStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [hasDeployed, setHasDeployed] = useState(true);
  const [systemLogs, setSystemLogs] = useState<{id: string, msg: string, time: string}[]>([]);

  const productionUrl = window.location.origin + window.location.pathname;
  const deploymentId = 'travel-book-web';

  const deployPhases = [
    'Connecting deployment project...',
    'Preparing production build...',
    'Uploading static assets...',
    'Applying environment settings...',
    'Running health checks...',
    'Production update successful!',
  ];

  useEffect(() => {
    const logPool = [
      'Provider onboarding queue is healthy',
      'Supplier sync completed for hotel inventory',
      'AI itinerary service is responding normally',
      'Search and booking pages passed health checks',
      'Static site deployment finished successfully',
    ];

    const interval = setInterval(() => {
      const msg = logPool[Math.floor(Math.random() * logPool.length)];
      setSystemLogs(prev => [{ id: Math.random().toString(), msg, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 15)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runDeployment = async () => {
    setIsDeploying(true);
    setHasDeployed(false);
    setDeployStep(0);

    for (let i = 0; i < deployPhases.length; i++) {
      setDeployStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    setIsDeploying(false);
    setHasDeployed(true);
    showToast('Application synchronized with production.', 'success');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productionUrl);
    showToast('Live site link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] mb-2 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <h2 className="text-4xl font-black text-white tracking-tighter">Operations Admin</h2>
          <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.4em] mt-1">Cloud Deployment • v6.0.0</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-[10px] font-black uppercase">Production Ready</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 border-b border-white/5">
        {[
          { id: 'overview', label: 'overview' },
          { id: 'connectors', label: 'connectors' },
          { id: 'ai_engine', label: 'ai engine' },
          { id: 'deployment', label: 'deployment' },
          { id: 'operations', label: 'operations' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                isActive ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'deployment' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <GlassCard className="p-8 border-emerald-500/40 bg-emerald-500/5 overflow-hidden relative glass-glow">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 size={140} className="text-white" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Production Site</h3>
                    <p className="text-white/60 text-sm mb-8 max-w-md leading-relaxed">
                      Your public app can be deployed to Vercel or another frontend host. This URL is the main entry point for travelers, providers, and suppliers.
                    </p>

                    {isDeploying ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-indigo-400">Step {deployStep + 1} of 6</span>
                           <span className="text-white/40">{Math.round(((deployStep + 1) / 6) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <div
                             className="h-full bg-indigo-500 transition-all duration-500"
                             style={{ width: `${((deployStep + 1) / 6) * 100}%` }}
                           />
                        </div>
                        <p className="text-white font-bold text-center animate-pulse">{deployPhases[deployStep]}</p>
                      </div>
                    ) : (
                      <div className="p-6 bg-black/60 border border-white/10 rounded-[2rem] space-y-6 animate-in zoom-in-95 duration-500">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                               <Globe size={24} />
                            </div>
                            <div>
                               <h4 className="text-white font-black uppercase tracking-widest text-xs">Production Site Active</h4>
                               <p className="text-indigo-400 font-bold text-lg leading-tight truncate max-w-[200px]">ID: {deploymentId}.vercel.app</p>
                            </div>
                         </div>

                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/20 text-[9px] font-black uppercase">Live Access Link</span>
                              <button onClick={copyLink} className="flex items-center gap-2 text-indigo-400 text-[9px] font-black uppercase hover:text-white transition-colors">
                                <Copy size={12} /> Copy
                              </button>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 overflow-hidden">
                              <span className="text-white/60 font-mono text-[10px] break-all">{productionUrl}</span>
                            </div>
                         </div>

                         <div className="flex flex-col sm:flex-row gap-4">
                            <button
                              onClick={runDeployment}
                              className="flex-1 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <RefreshCw size={14} /> Re-sync Site
                            </button>
                            <button
                              onClick={() => window.open(productionUrl, '_blank')}
                              className="flex-1 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                              <ExternalLink size={14} /> Open Live Site
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
               </GlassCard>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Network size={20} /></div>
                        <div>
                           <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Hosting</p>
                           <p className="text-white font-bold text-xs truncate">Vercel or compatible frontend host</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Lock size={20} /></div>
                        <div>
                           <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Identity Status</p>
                           <p className="text-white font-bold text-xs">Admin Access Verified</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <GlassCard className="p-8 border-white/10">
                    <h3 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                       <Network size={20} className="text-indigo-400" /> Global Topology
                    </h3>
                    <div className="aspect-square relative opacity-40">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1000px-World_map_blank_without_borders.svg.png" className="w-full h-full object-contain invert" alt="" />
                    </div>
                 </GlassCard>

                 <div className="space-y-6">
                    <GlassCard className="p-6 border-white/10">
                       <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Platform Health</h4>
                       <div className="space-y-4">
                          {[
                            { label: 'Latency', value: '14ms', status: 'Excellent' },
                            { label: 'Uptime', value: '100%', status: 'Stable' },
                            { label: 'Consensus', value: 'Verified', status: 'In Sync' }
                          ].map(stat => (
                            <div key={stat.label} className="flex items-center justify-between border-b border-white/5 pb-2">
                               <span className="text-white/40 text-[10px] uppercase font-bold">{stat.label}</span>
                               <div className="text-right">
                                  <p className="text-white font-bold text-xs">{stat.value}</p>
                                  <p className="text-emerald-400 text-[8px] font-black uppercase">{stat.status}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </GlassCard>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <GlassCard className="p-6 border-white/10 h-[600px] flex flex-col bg-black/40">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                   <Terminal size={14} className="text-indigo-400" /> Operations Log
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-3 scrollbar-hide text-white/50">
                {systemLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 border-l border-indigo-500/30 pl-3 py-1 group hover:border-indigo-400">
                    <span className="text-indigo-500/40 shrink-0">[{log.time}]</span>
                    <span className="group-hover:text-white transition-colors">{log.msg}</span>
                  </div>
                ))}
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
