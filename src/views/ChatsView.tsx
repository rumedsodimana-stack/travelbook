'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Chat, Message, User, MessageAsset } from '@/types';
import {
  Search, Send, Bot, Phone, Video, Info,
  ChevronLeft, MoreVertical, ShieldCheck,
  Clock, CheckCheck, MapPin, Sparkles, MessageSquare,
  Wallet, Image as ImageIcon, Plus, X, ArrowUpRight,
  Hash, Shield, Zap, Globe, Cpu, Loader2
} from 'lucide-react';
import { UserLabel as UserBadge } from '@/components/UserLabel';
import { useToast } from '@/components/ToastProvider';

interface ChatsViewProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  currentUser: User;
}

const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat-u1': [
    { id: 'm1', senderId: 'u1', text: "Hey! I saw your trip post. Are those flight times still accurate?", timestamp: "10:20 AM" },
    { id: 'm2', senderId: 'demo-user-123', text: "Yes, they were current when I checked. It was such a good view too.", timestamp: "10:22 AM" },
  ]
};

export const ChatsView: React.FC<ChatsViewProps> = ({ chats, setChats, currentUser }) => {
  const { showToast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferType, setTransferType] = useState<'crypto' | 'nft' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedChatId) scrollToBottom();
  }, [messages, selectedChatId]);

  const handleSendMessage = (asset?: MessageAsset) => {
    if ((!messageText.trim() && !asset) || !selectedChatId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      asset: asset
    };

    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
    }));

    setChats(prev => prev.map(c =>
      c.id === selectedChatId ? { ...c, lastMessage: asset ? `Sent ${asset.type === 'crypto' ? 'travel credit' : 'a travel pass'}` : messageText, timestamp: 'Now' } : c
    ));

    setMessageText('');
    setShowAssetPicker(false);
    setTransferType(null);

    // AI logic for business accounts
    if (selectedChat?.participant.isBusiness && !asset) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          senderId: selectedChat.participant.id,
          text: 'Thanks for your message. I'm checking the latest details now.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({
          ...prev,
          [selectedChatId]: [...(prev[selectedChatId] || []), aiResponse]
        }));
      }, 1500);
    }
  };

  const executeTransfer = async (type: 'crypto' | 'nft') => {
    setIsTransferring(true);
    // Simulate transfer confirmation
    await new Promise(r => setTimeout(r, 2000));

    const asset: MessageAsset = type === 'crypto' ? {
      type: 'crypto',
      value: '50.00',
      symbol: 'Credit',
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(0, 4)}`,
    } : {
      type: 'nft',
      value: 'Weekend Travel Pass #842',
      imageUrl: `https://picsum.photos/seed/nft-${Math.random()}/400/400`,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(0, 4)}`,
      metadata: 'Premium access'
    };

    setIsTransferring(false);
    handleSendMessage(asset);
    showToast(`${type === 'crypto' ? 'Travel credit' : 'Pass'} sent successfully`, "success");
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar - Chat List */}
      <div className={`w-full lg:w-[350px] flex flex-col gap-4 ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
          {chats.map(chat => (
            <GlassCard
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 border-white/10 cursor-pointer transition-all hover:bg-white/5 ${selectedChatId === chat.id ? 'bg-indigo-500/20 border-indigo-500/40' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img src={chat.participant.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/20" alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-white font-bold text-sm truncate">{chat.participant.name}</h4>
                    <span className="text-[9px] text-white/20 font-bold uppercase">{chat.timestamp}</span>
                  </div>
                  <p className="text-white/40 text-[11px] truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedChatId ? 'hidden lg:flex' : 'flex'} animate-in slide-in-from-right-4 duration-500`}>
        {selectedChatId && selectedChat ? (
          <GlassCard className="flex-1 flex flex-col border-white/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <img src={selectedChat.participant.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                    {selectedChat.participant.name}
                    {selectedChat.participant.isBusiness && <ShieldCheck size={14} className="text-blue-400" />}
                  </h3>
                  <UserBadge category={selectedChat.participant.category} showIcon={false} className="opacity-60" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 bg-white/5 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all shadow-xl">
                   <Info size={18} />
                </button>
                <button className="p-3 text-white/40 hover:text-white transition-colors"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {(messages[selectedChatId] || []).map((msg, idx) => {
                const isSelf = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    {msg.asset && (
                      <div className={`mb-2 w-full max-w-[280px] p-0.5 rounded-3xl bg-gradient-to-br ${msg.asset.type === 'crypto' ? 'from-indigo-500 to-purple-600' : 'from-emerald-400 to-blue-500'} shadow-[0_0_30px_rgba(99,102,241,0.2)]`}>
                         <div className="bg-slate-950 rounded-[1.4rem] overflow-hidden">
                            {msg.asset.type === 'nft' && (
                              <img src={msg.asset.imageUrl} className="w-full h-32 object-cover opacity-80" alt="Travel pass" />
                            )}
                            <div className="p-4">
                               <div className="flex items-center justify-between mb-3">
                                  <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${msg.asset.type === 'crypto' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                     {msg.asset.type === 'crypto' ? <Wallet size={16} /> : <ImageIcon size={16} />}
                                  </div>
                                  <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[7px] font-black text-emerald-400 uppercase tracking-widest">Sent</div>
                               </div>
                               <h5 className="text-white font-black text-xs uppercase tracking-tight">{msg.asset.type === 'crypto' ? 'Travel Credit' : 'Travel Pass'}</h5>
                               <p className="text-white font-black text-2xl tracking-tighter mt-1">
                                  {msg.asset.type === 'crypto' ? `${msg.asset.value} ${msg.asset.symbol}` : msg.asset.value}
                               </p>
                               {msg.asset.metadata && <p className="text-white/40 text-[9px] font-bold uppercase mt-1">{msg.asset.metadata}</p>}
                               <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-white/20 font-mono text-[8px] truncate max-w-[120px]">{msg.asset.txHash}</span>
                                  <ArrowUpRight size={12} className="text-white/20" />
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                    {msg.text && (
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1 opacity-40">
                          <span className="text-[9px] font-bold uppercase">{msg.timestamp}</span>
                          {isSelf && <CheckCheck size={10} />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Asset Hub Overlay */}
            {showAssetPicker && (
              <div className="absolute bottom-[80px] left-6 right-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
                 <GlassCard className="p-4 border-indigo-500/40 shadow-2xl backdrop-blur-3xl bg-slate-950/90">
                    <div className="flex items-center justify-between mb-4 px-1">
                       <h4 className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <Plus size={14} className="text-indigo-400" /> Send Extra
                       </h4>
                       <button onClick={() => { setShowAssetPicker(false); setTransferType(null); }} className="text-white/40 hover:text-white"><X size={16} /></button>
                    </div>

                    {!transferType ? (
                       <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setTransferType('crypto')}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                          >
                             <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
                             <span className="text-white font-black text-[9px] uppercase tracking-widest">Travel Credit</span>
                          </button>
                          <button
                            onClick={() => setTransferType('nft')}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                          >
                             <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform"><ImageIcon size={24} /></div>
                             <span className="text-white font-black text-[9px] uppercase tracking-widest">Travel Pass</span>
                          </button>
                       </div>
                    ) : (
                       <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                {transferType === 'crypto' ? <Wallet className="text-indigo-400" /> : <ImageIcon className="text-emerald-400" />}
                                <div>
                                   <p className="text-white font-black text-xs uppercase tracking-tighter">Confirm Send</p>
                                   <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Review before sending</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-white font-black text-lg tracking-tighter">{transferType === 'crypto' ? '50.00 Credit' : 'Weekend Travel Pass #842'}</p>
                             </div>
                          </div>

                          <button
                            onClick={() => executeTransfer(transferType)}
                            disabled={isTransferring}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl ${transferType === 'crypto' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}
                          >
                             {isTransferring ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                             {isTransferring ? 'Sending...' : 'Send Now'}
                          </button>
                       </div>
                    )}
                 </GlassCard>
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="p-4 bg-white/5 border-t border-white/5 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssetPicker(!showAssetPicker)}
                  className={`p-4 rounded-2xl border transition-all shadow-xl flex items-center justify-center ${showAssetPicker ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                  <Plus size={20} className={showAssetPicker ? 'rotate-45 transition-transform' : 'transition-transform'} />
                </button>
                <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/40 transition-all">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder-white/20"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() && !showAssetPicker}
                    className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-20 hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <div className="p-6 bg-white/5 rounded-[2.5rem] mb-6">
              <MessageSquare size={64} className="text-white" />
            </div>
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Messages</h3>
            <p className="text-sm max-w-xs mt-2 leading-relaxed">Pick a conversation to ask a question, plan a trip, or stay in touch.</p>
          </div>
        )}
      </div>
    </div>
  );
};
