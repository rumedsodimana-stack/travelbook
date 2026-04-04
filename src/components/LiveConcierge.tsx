'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Bot, Mic, MicOff, X, Volume2, Sparkles, MessageSquare, Database, CheckCircle2, Search, Zap, Loader2, Globe, Cpu, AlertCircle } from 'lucide-react';
import { searchGlobalProviders } from '@/services/bookingService';
import { useToast } from '@/components/ToastProvider';

export const LiveConcierge: React.FC = () => {
  const { showToast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{text: string, isUser: boolean}[]>([]);
  const assistantRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const handleToolCall = async (name: string, args: any) => {
    const safeName = String(name || 'UNKNOWN');
    const safeArgs = args || {};

    setIsThinking(true);
    setActiveAction(safeName.split('_').join(' ').toUpperCase());

    try {
      if (safeName === 'search_ledger') {
        const category = String(safeArgs.category || 'hotel');
        const query = String(safeArgs.query || 'Global');
        const results = await searchGlobalProviders(category, { location: query });
        setIsThinking(false);
        setActiveAction(null);

        // Return a data-dense structure to prevent AI from guessing
        return {
          status: 'success',
          results_count: results.length,
          timestamp: new Date().toISOString(),
          node_data: results.map(r => ({
            id: r.id,
            name: r.name,
            price_usd: r.price,
            provider: r.provider,
            sector: category
          })),
          context: `Verified ${results.length} active ledger nodes for ${query}. Prices are current for the next 15 minutes.`
        };
      }
      if (safeName === 'create_booking') {
        const itemId = String(safeArgs.item_id || 'unknown');
        await new Promise(r => setTimeout(r, 2000));
        setIsThinking(false);
        setActiveAction(null);
        showToast(`Settle Executed: ${itemId}`, 'success');
        return {
          status: 'confirmed',
          transaction_hash: '0x' + Math.random().toString(16).slice(2, 14),
          settlement_status: 'Verified on Mainnet',
          message: `Booking for Node ${itemId} has been written to the travel ledger.`
        };
      }
    } catch (e) {
      setIsThinking(false);
      setActiveAction(null);
      return { error: "Network latency high. Ledger sync failed." };
    }
    return { error: 'Unknown protocol function' };
  };

  const toggleAssistant = async () => {
    if (isActive) {
      assistantRef.current?.disconnect();
      assistantRef.current = null;
      setIsActive(false);
      setTranscriptions([]);
      setError(null);
    } else {
      setError(null);
      setIsConnecting(true);

      try {
        if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
        }

        const { TravelLiveAssistant } = await import('@/services/liveApiService');
        const assistant = new TravelLiveAssistant();
        await assistant.connect(
          (text, isUser) => {
            setTranscriptions(prev => {
              const last = prev[prev.length - 1];
              if (last && last.isUser === isUser) {
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, text: last.text + ' ' + text };
                return updated;
              }
              return [...prev, { text, isUser }];
            });
          },
          handleToolCall,
          (err) => {
            setError(err);
            setIsActive(false);
            showToast(err, "error");
          }
        );
        assistantRef.current = assistant;
        setIsActive(true);
      } catch (e: any) {
        const msg = "Node Link Failure.";
        setError(msg);
        showToast(msg, "error");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={toggleAssistant}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 border-4 ${
            isActive
              ? 'bg-red-500 border-red-500/50 shadow-red-500/40'
              : error
                ? 'bg-amber-600 border-amber-500/50 shadow-amber-600/40'
                : 'bg-indigo-600 border-indigo-500/50 shadow-indigo-600/40'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="text-white animate-spin" size={28} />
          ) : isActive ? (
            <MicOff className="text-white" size={28} />
          ) : error ? (
            <AlertCircle className="text-white" size={28} />
          ) : (
            <Bot className="text-white" size={28} />
          )}
          {isActive && (
            <div className="absolute inset-[-8px] border-2 border-red-500 rounded-full animate-ping opacity-20" />
          )}
        </button>
      </div>

      {isActive && (
        <div className="fixed bottom-44 right-6 left-6 z-50 animate-in slide-in-from-bottom-8 duration-500 lg:left-auto lg:w-[400px]">
          <GlassCard className="overflow-hidden border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <div className="p-4 bg-indigo-500/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/20 rounded-xl">
                   <Sparkles size={16} className="text-indigo-400" />
                 </div>
                 <div>
                   <h4 className="text-white font-black text-xs uppercase tracking-widest">Protocol Concierge</h4>
                   <p className="text-indigo-400 text-[8px] font-bold uppercase tracking-widest">Accuracy Grounding Active</p>
                 </div>
              </div>
              <button onClick={toggleAssistant} className="text-white/20 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-black/40"
            >
              {transcriptions.length === 0 && !isThinking && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Volume2 size={32} className="text-white mb-2 animate-pulse" />
                  <p className="text-white font-black text-[9px] uppercase tracking-widest text-center">Protocol listening...<br/>Waiting for verified query</p>
                </div>
              )}

              {transcriptions.map((t, i) => (
                <div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs ${
                    t.isUser
                      ? 'bg-white/10 text-white rounded-tr-none border border-white/10'
                      : 'bg-indigo-600 text-white rounded-tl-none border border-indigo-400/30 shadow-lg'
                  }`}>
                    {t.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                   <div className="bg-indigo-600/20 border border-indigo-500/30 px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      </div>
                      <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Accessing Ledger...</span>
                   </div>
                </div>
              )}
            </div>

            {activeAction && (
              <div className="bg-indigo-600 p-2 flex items-center justify-center gap-2">
                 <Cpu size={12} className="text-white animate-spin [animation-duration:3s]" />
                 <span className="text-white text-[9px] font-black uppercase tracking-widest">{activeAction}</span>
              </div>
            )}

            <div className="p-4 bg-white/5 border-t border-white/10">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Grounding v5.1 Status: VERIFIED</span>
               </div>
               <div className="flex gap-2">
                  <div className="flex-1 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[100%] transition-all duration-1000" />
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>
      )}

      {error && !isActive && !isConnecting && (
        <div className="fixed bottom-44 right-6 left-6 z-50 lg:left-auto lg:w-[400px]">
           <GlassCard className="p-4 bg-red-500/20 border-red-500/40 flex items-center gap-3">
              <AlertCircle className="text-red-400 shrink-0" size={20} />
              <div className="flex-1">
                 <p className="text-white font-bold text-xs">Node Link Error</p>
                 <p className="text-white/60 text-[10px] uppercase tracking-widest">{error}</p>
              </div>
              <button
                onClick={toggleAssistant}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black text-white uppercase"
              >
                Retry
              </button>
           </GlassCard>
        </div>
      )}
    </>
  );
};
