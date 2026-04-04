'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Chat, Message, User, MessageAsset } from '@/types';
import {
  Search, Send, Info,
  ChevronLeft, MoreVertical, ShieldCheck,
  CheckCheck, MessageSquare,
  Wallet, Image as ImageIcon, Plus, X, ArrowUpRight,
  Loader2, Smile, Paperclip
} from 'lucide-react';
import { UserLabel as UserBadge } from '@/components/UserLabel';
import { useToast } from '@/components/ToastProvider';

interface ChatsViewProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  currentUser: User;
}

const EMOJI_LIST = ['😊', '❤️', '🔥', '😂', '👍', '🙏', '✈️', '🌍', '🏖️', '🏔️', '🌅', '🎉', '😍', '💯', '🤩', '😎', '🙌', '👌', '🫶', '⭐'];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat-u1': [
    { id: 'm1', senderId: 'u1', text: "Hey! I saw your trip post from Kyoto. Was it as magical as it looks?", timestamp: "9:55 AM" },
    { id: 'm2', senderId: 'demo-user-123', text: "Absolutely — the bamboo grove at sunrise was unreal. No crowds either.", timestamp: "9:57 AM" },
    { id: 'm3', senderId: 'u1', text: "Did you save that hotel stay from the discovery feed? The one near Arashiyama?", timestamp: "10:01 AM" },
    { id: 'm4', senderId: 'demo-user-123', text: "Yes! I bookmarked it. The glass room overlooking the river was stunning. Want me to send the link?", timestamp: "10:03 AM" },
    { id: 'm5', senderId: 'u1', text: "Please do! We're thinking late March — is that a good time to visit?", timestamp: "10:08 AM" },
    { id: 'm6', senderId: 'demo-user-123', text: "Late March is cherry blossom season. It gets busy but it's worth it. Book early.", timestamp: "10:10 AM" },
    { id: 'm7', senderId: 'u1', text: "Thanks for the heads up! Do you want to sync itineraries? Maybe we overlap.", timestamp: "10:20 AM" },
    { id: 'm8', senderId: 'demo-user-123', text: "That would be fun. I'll drop my dates here — let's compare.", timestamp: "10:22 AM" },
  ],
  'chat-u2': [
    { id: 'b1', senderId: 'u2', text: "Hi there! Your rail booking window is ready. Seat selection opens in 24 hours.", timestamp: "Yesterday" },
    { id: 'b2', senderId: 'demo-user-123', text: "Thanks! Which line is this for — the scenic mountain route?", timestamp: "Yesterday" },
    { id: 'b3', senderId: 'u2', text: "That's correct — the Blue Horizon Alpine Express, departing Geneva. Your reference is BHR-4421.", timestamp: "Yesterday" },
    { id: 'b4', senderId: 'demo-user-123', text: "Perfect. Can I upgrade to a panorama car?", timestamp: "Yesterday" },
    { id: 'b5', senderId: 'u2', text: "Yes — panorama upgrades are available for +$38 per person. I can process that now if you'd like.", timestamp: "Yesterday" },
    { id: 'b6', senderId: 'demo-user-123', text: "Let's do it. Add the panorama upgrade for two passengers please.", timestamp: "Yesterday" },
    { id: 'b7', senderId: 'u2', text: "Done! Panorama upgrade confirmed. You'll receive an updated e-ticket shortly. Enjoy the ride! 🏔️", timestamp: "Yesterday" },
  ],
  'chat-u3': [
    { id: 'c1', senderId: 'u3', text: "Hey! Loved your Bali photos. I'm heading there in two weeks — any must-dos?", timestamp: "Mon" },
    { id: 'c2', senderId: 'demo-user-123', text: "Ubud rice terraces in the morning before it gets hot. And skip Kuta — head to Canggu instead.", timestamp: "Mon" },
    { id: 'c3', senderId: 'u3', text: "Good call. What about food? Any specific warungs?", timestamp: "Mon" },
    { id: 'c4', senderId: 'demo-user-123', text: "Warung Babi Guling Ibu Oka is the classic. Also try the night market near Seminyak on Thursdays.", timestamp: "Mon" },
    { id: 'c5', senderId: 'u3', text: "This is gold, thank you 🙌 Adding it all to my plan.", timestamp: "Mon" },
  ],
  'chat-u4': [
    { id: 'd1', senderId: 'u4', text: "Morning! Just to confirm — your suite is ready for early check-in at 11am.", timestamp: "Tue" },
    { id: 'd2', senderId: 'demo-user-123', text: "Amazing, thank you! Is the rooftop pool open that time of day?", timestamp: "Tue" },
    { id: 'd3', senderId: 'u4', text: "The pool opens at 10am daily. Your ocean-facing suite has direct access. A welcome drink will be waiting.", timestamp: "Tue" },
    { id: 'd4', senderId: 'demo-user-123', text: "Perfect. We'll be there around 11:15.", timestamp: "Tue" },
    { id: 'd5', senderId: 'u4', text: "Wonderful — our concierge will greet you at arrival. Safe travels!", timestamp: "Tue" },
  ],
  'chat-u5': [
    { id: 'e1', senderId: 'demo-user-123', text: "Hey Marcus — still looking for a buddy for the Patagonia trek in April?", timestamp: "Wed" },
    { id: 'e2', senderId: 'u5', text: "Yes! Dates are April 12–22. You in?", timestamp: "Wed" },
    { id: 'e3', senderId: 'demo-user-123', text: "Those dates work. I was eyeing the W Circuit. Same route?", timestamp: "Wed" },
    { id: 'e4', senderId: 'u5', text: "Exactly — W Circuit, 5 days hiking. I have all the permits already.", timestamp: "Wed" },
    { id: 'e5', senderId: 'demo-user-123', text: "Let's do it. Want to coordinate gear lists this week?", timestamp: "Wed" },
    { id: 'e6', senderId: 'u5', text: "Yes! I'll share a doc. This is going to be epic 🏔️🔥", timestamp: "Wed" },
  ],
};

export const ChatsView: React.FC<ChatsViewProps> = ({ chats, setChats, currentUser }) => {
  const { showToast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferType, setTransferType] = useState<'crypto' | 'nft' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const filteredChats = chats.filter(c =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChatId) scrollToBottom();
  }, [messages, selectedChatId]);

  const insertEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleAttachment = () => {
    if (!selectedChatId) return;
    const imageMsg: Message = {
      id: `attach-${Date.now()}`,
      senderId: currentUser.id,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // Add a photo message using asset-like display
    const photoMsg: Message = {
      id: `photo-${Date.now()}`,
      senderId: currentUser.id,
      text: '📎 Sent a photo',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), photoMsg],
    }));
    setChats(prev => prev.map(c =>
      c.id === selectedChatId ? { ...c, lastMessage: '📎 Sent a photo', timestamp: 'Now' } : c
    ));
    showToast('Photo attached', 'info');
  };

  const handleSendMessage = (asset?: MessageAsset) => {
    if ((!messageText.trim() && !asset) || !selectedChatId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      asset,
    };

    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
    }));

    setChats(prev => prev.map(c =>
      c.id === selectedChatId
        ? { ...c, lastMessage: asset ? `Sent ${asset.type === 'crypto' ? 'travel credit' : 'a travel pass'}` : messageText, timestamp: 'Now' }
        : c
    ));

    setMessageText('');
    setShowAssetPicker(false);
    setShowEmojiPicker(false);
    setTransferType(null);

    if (selectedChat?.participant.isBusiness && !asset) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          senderId: selectedChat.participant.id,
          text: "Thanks for your message. I'm checking the latest details now.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => ({
          ...prev,
          [selectedChatId]: [...(prev[selectedChatId] || []), aiResponse],
        }));
      }, 1500);
    }
  };

  const executeTransfer = async (type: 'crypto' | 'nft') => {
    setIsTransferring(true);
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
      metadata: 'Premium access',
    };

    setIsTransferring(false);
    handleSendMessage(asset);
    showToast(`${type === 'crypto' ? 'Travel credit' : 'Pass'} sent successfully`, 'success');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className={`w-full lg:w-[340px] flex flex-col gap-4 ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-white/20"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
          {filteredChats.length === 0 ? (
            <div className="py-12 text-center opacity-40">
              <MessageSquare className="mx-auto mb-3 text-white" size={32} />
              <p className="text-white text-sm font-bold">No conversations match</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <GlassCard
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-4 border-white/10 cursor-pointer transition-all hover:bg-white/5 ${selectedChatId === chat.id ? 'bg-indigo-500/20 border-indigo-500/40' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={chat.participant.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/20" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-white font-bold text-sm truncate">{chat.participant.name}</h4>
                      <span className="text-[9px] text-white/20 font-bold uppercase shrink-0 ml-2">{chat.timestamp}</span>
                    </div>
                    <p className="text-white/40 text-[11px] truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white text-[9px] font-black">{chat.unreadCount}</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedChatId ? 'hidden lg:flex' : 'flex'} animate-in slide-in-from-right-4 duration-500`}>
        {selectedChatId && selectedChat ? (
          <GlassCard className="flex-1 flex flex-col border-white/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <img src={selectedChat.participant.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                    {selectedChat.participant.name}
                    {selectedChat.participant.isBusiness && <ShieldCheck size={13} className="text-blue-400" />}
                  </h3>
                  <UserBadge category={selectedChat.participant.category} showIcon={false} className="opacity-60" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-white/5 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all">
                  <Info size={18} />
                </button>
                <button className="p-2.5 text-white/40 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
              {(messages[selectedChatId] || []).map((msg) => {
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
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-lg ${
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

            {/* Emoji Picker Overlay */}
            {showEmojiPicker && (
              <div className="absolute bottom-[76px] left-6 z-20 animate-in slide-in-from-bottom-2 duration-200">
                <GlassCard className="p-3 border-white/20 bg-slate-950/95 backdrop-blur-3xl shadow-2xl w-72">
                  <div className="grid grid-cols-10 gap-1">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition-all active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Asset Hub Overlay */}
            {showAssetPicker && (
              <div className="absolute bottom-[76px] left-20 right-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
                <GlassCard className="p-4 border-indigo-500/40 shadow-2xl backdrop-blur-3xl bg-slate-950/90">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Plus size={14} className="text-indigo-400" /> Send Extra
                    </h4>
                    <button onClick={() => { setShowAssetPicker(false); setTransferType(null); }} className="text-white/40 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  {!transferType ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTransferType('crypto')}
                        className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                      >
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform"><Wallet size={22} /></div>
                        <span className="text-white font-black text-[9px] uppercase tracking-widest">Travel Credit</span>
                      </button>
                      <button
                        onClick={() => setTransferType('nft')}
                        className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                      >
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform"><ImageIcon size={22} /></div>
                        <span className="text-white font-black text-[9px] uppercase tracking-widest">Travel Pass</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {transferType === 'crypto' ? <Wallet className="text-indigo-400" size={20} /> : <ImageIcon className="text-emerald-400" size={20} />}
                          <div>
                            <p className="text-white font-black text-xs uppercase tracking-tighter">Confirm Send</p>
                            <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Review before sending</p>
                          </div>
                        </div>
                        <p className="text-white font-black text-base tracking-tighter">
                          {transferType === 'crypto' ? '50.00 Credit' : 'Weekend Travel Pass #842'}
                        </p>
                      </div>
                      <button
                        onClick={() => executeTransfer(transferType)}
                        disabled={isTransferring}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 ${
                          transferType === 'crypto' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isTransferring ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isTransferring ? 'Sending...' : 'Send Now'}
                      </button>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
              className="p-3 bg-white/5 border-t border-white/5 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-2">
                {/* Asset picker */}
                <button
                  type="button"
                  onClick={() => { setShowAssetPicker(!showAssetPicker); setShowEmojiPicker(false); }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center ${
                    showAssetPicker ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}
                >
                  <Plus size={18} className={showAssetPicker ? 'rotate-45' : ''} style={{ transition: 'transform 0.2s' }} />
                </button>

                {/* Attachment */}
                <button
                  type="button"
                  onClick={handleAttachment}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <Paperclip size={18} />
                </button>

                {/* Text input */}
                <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-2xl px-2 focus-within:border-indigo-500/40 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent border-none text-white text-sm px-3 py-3 focus:outline-none placeholder-white/20"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                  />
                  {/* Emoji picker button */}
                  <button
                    type="button"
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAssetPicker(false); }}
                    className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'text-amber-400' : 'text-white/30 hover:text-white/70'}`}
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-20 hover:bg-indigo-500 transition-all shadow-lg active:scale-95 ml-1"
                  >
                    <Send size={16} />
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
