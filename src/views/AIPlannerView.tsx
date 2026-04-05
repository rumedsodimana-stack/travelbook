'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Sparkles, ChevronLeft, Star,
  RefreshCw, ArrowRight, Clock, Zap, CheckCircle2, X,
} from 'lucide-react';
import { PlanItem, PlanItemCategory, TripPlan, AppRoute } from '@/types';
import { generateTripPlan, DEMO_PRESET, TripPlanInput } from '@/services/tripPlannerService';
import { cascadeTimingChange } from '@/utils/planCascade';

interface AIPlannerViewProps {
  onBack: () => void;
  onNavigate?: (route: AppRoute) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<PlanItemCategory, string> = {
  visa: '🛂', flight: '✈️', accommodation: '🏨', transport: '🚕',
  activity: '🎯', dining: '🍽️', event: '🎭', entertainment: '🎡',
};

const CATEGORY_LABELS: Record<PlanItemCategory, string> = {
  visa: 'VISA', flight: 'FLIGHT', accommodation: 'HOTEL',
  transport: 'TRANSPORT', activity: 'ACTIVITY', dining: 'DINING',
  event: 'EVENT', entertainment: 'FUN',
};

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

function fmtDuration(mins: number): string {
  if (!mins) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function fmtCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `${currency} ${Math.round(amount)}`; }
}

const LOADING_MESSAGES = [
  'Checking visa requirements…',
  'Scanning real-time flight routes…',
  'Finding the best-rated hotels…',
  'Discovering hidden local gems…',
  'Mapping timing between locations…',
  'Building your perfect timeline…',
  'Almost ready…',
];

// ─── Option card ──────────────────────────────────────────────────────────────
interface OptionCardProps {
  option: TripPlan['items'][0]['options'][0];
  isSelected: boolean;
  currency: string;
  onSelect: () => void;
}
const OptionCard: React.FC<OptionCardProps> = ({ option, isSelected, currency, onSelect }) => (
  <div className={`relative flex-shrink-0 w-64 rounded-3xl border p-4 transition-all duration-300 cursor-pointer select-none
    ${isSelected
      ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.3)] ring-1 ring-teal-500/60'
      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}
    onClick={onSelect}>
    {/* Image placeholder */}
    <div className="relative mb-3 h-28 w-full overflow-hidden rounded-2xl bg-white/8">
      {option.imageUrl
        ? <img src={option.imageUrl} alt={option.title} className="h-full w-full object-cover" />
        : <div className="flex h-full items-center justify-center text-4xl opacity-40">
            {option.tags?.[0]?.includes('⭐') ? '⭐' : '🏷️'}
          </div>}
      {isSelected && (
        <div className="absolute right-2 top-2 rounded-full bg-teal-500 p-1">
          <CheckCircle2 size={14} className="text-white" />
        </div>
      )}
    </div>
    <p className="font-bold text-white leading-tight text-sm">{option.title}</p>
    <p className="mt-0.5 text-xs text-white/55 leading-snug line-clamp-2">{option.subtitle}</p>
    {option.rating != null && (
      <div className="mt-1.5 flex items-center gap-1">
        <Star size={11} className="fill-amber-300 text-amber-300" />
        <span className="text-xs font-semibold text-amber-300">{option.rating.toFixed(1)}</span>
        {option.reviewCount && <span className="text-[10px] text-white/40">({option.reviewCount.toLocaleString()})</span>}
      </div>
    )}
    {option.tags && option.tags.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {option.tags.slice(0, 3).map(t => (
          <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">{t}</span>
        ))}
      </div>
    )}
    <div className="mt-3 flex items-end justify-between">
      <span className={`text-sm font-black ${isSelected ? 'text-teal-400' : 'text-white'}`}>
        {option.price === 0 ? 'Free' : fmtCurrency(option.price, currency)}
      </span>
      {option.duration && (
        <span className="text-[10px] text-white/40"><Clock size={9} className="inline mr-0.5" />{fmtDuration(option.duration)}</span>
      )}
    </div>
    <button onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`mt-2.5 w-full rounded-xl py-2 text-xs font-semibold transition-all ${isSelected
        ? 'bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/30'
        : 'border border-white/10 bg-white/10 hover:bg-white/20 text-white rounded-xl'}`}>
      {isSelected ? '✓ Selected' : 'SELECT'}
    </button>
  </div>
);

// ─── Travel connector ─────────────────────────────────────────────────────────
const TravelConnector: React.FC<{ minutes: number }> = ({ minutes }) => {
  if (!minutes) return null;
  const icon = minutes > 120 ? '✈️' : minutes > 30 ? '🚕' : '🚶';
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="h-6 w-px bg-teal-500/40 ml-5" />
      <div className="ml-1 flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1">
        <span className="text-xs">{icon}</span>
        <span className="text-[11px] font-semibold text-teal-400">{fmtDuration(minutes)} travel</span>
      </div>
    </div>
  );
};

// ─── Transport card ───────────────────────────────────────────────────────────
const TRANSPORT_ICONS = ['🚗', '🚕', '🚌'];
const TRANSPORT_LABELS = ['Ride', 'Taxi', 'Transit'];

interface TransportCardProps {
  item: PlanItem;
  itemIndex: number;
  currency: string;
  onSelectOption: (itemIndex: number, optionIndex: number) => void;
  onRemove: () => void;
}
const TransportCard: React.FC<TransportCardProps> = ({ item, itemIndex, currency, onSelectOption, onRemove }) => {
  const selectedOpt = item.options[item.selectedOptionIndex];
  return (
    <div className="flex items-stretch gap-2 px-1 my-1">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center w-5 flex-shrink-0 pt-1 pb-1">
        <div className="w-px flex-1 bg-teal-500/25" />
        <span className="text-base leading-none my-1">{TRANSPORT_ICONS[item.selectedOptionIndex] ?? '🚗'}</span>
        <div className="w-px flex-1 bg-teal-500/25" />
      </div>
      {/* Card body */}
      <div className="flex-1 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">TRANSFER</p>
          <p className="text-xs text-white/60 truncate">{selectedOpt?.title ?? 'Transfer'}</p>
          <p className="text-[10px] text-white/35 mt-0.5">
            <Clock size={9} className="inline mr-0.5" />{fmtTime(item.scheduledAt)} · {fmtDuration(item.durationMinutes)}
          </p>
        </div>
        {/* Option pill buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          {item.options.map((opt, oi) => (
            <button key={opt.id} onClick={() => onSelectOption(itemIndex, oi)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                oi === item.selectedOptionIndex
                  ? 'bg-teal-500/20 border border-teal-400/50 text-teal-300'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
              }`}>
              <span>{TRANSPORT_ICONS[oi] ?? '🚗'}</span>
              <span>{TRANSPORT_LABELS[oi] ?? opt.title.split(' ')[0]}</span>
              <span className="text-white/40">{opt.price === 0 ? '' : ` $${Math.round(opt.price)}`}</span>
            </button>
          ))}
        </div>
        {/* Remove button */}
        <button onClick={onRemove}
          className="flex-shrink-0 ml-1 rounded-xl p-1.5 text-white/25 hover:bg-white/10 hover:text-white/60 transition-all"
          title="Remove this transfer">
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Plan card ────────────────────────────────────────────────────────────────
interface PlanCardProps {
  item: PlanItem;
  itemIndex: number;
  currency: string;
  highlightedIndex: number | null;
  onSelectOption: (itemIndex: number, optionIndex: number) => void;
  onRemove?: () => void;
}
const PlanCard: React.FC<PlanCardProps> = ({ item, itemIndex, currency, highlightedIndex, onSelectOption, onRemove }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHighlighted = highlightedIndex === itemIndex;
  const selectedOpt = item.options[item.selectedOptionIndex];

  return (
    <div className={`rounded-3xl border transition-all duration-500 overflow-hidden
      ${isHighlighted ? 'border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.2)] bg-amber-400/5' : 'border-white/10 bg-white/5'}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg">
          {CATEGORY_ICONS[item.category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
              {CATEGORY_LABELS[item.category]}
            </span>
            {item.isRequired && (
              <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">REQUIRED</span>
            )}
            {isHighlighted && (
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 animate-pulse">UPDATED</span>
            )}
          </div>
          <p className="text-xs font-semibold text-white/70 mt-0.5">
            <Clock size={10} className="inline mr-1 text-white/40" />
            {fmtTime(item.scheduledAt)}
            {item.endAt && <span className="text-white/35"> → {fmtTime(item.endAt)}</span>}
          </p>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-black text-white">{fmtCurrency(selectedOpt?.price ?? 0, currency)}</p>
            {selectedOpt?.duration && (
              <p className="text-[10px] text-white/40">{fmtDuration(selectedOpt.duration)}</p>
            )}
          </div>
          {!item.isRequired && onRemove && (
            <button onClick={onRemove}
              className="mt-0.5 rounded-xl p-1.5 text-white/25 hover:bg-white/10 hover:text-white/70 transition-all"
              title="Remove this item">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {/* Horizontal scroll carousel */}
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-4 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {item.options.map((opt, oi) => (
          <OptionCard key={opt.id} option={opt} isSelected={oi === item.selectedOptionIndex}
            currency={currency} onSelect={() => onSelectOption(itemIndex, oi)} />
        ))}
      </div>
      {item.notes && (
        <p className="mx-4 mb-3 rounded-2xl bg-white/5 px-3 py-2 text-[11px] italic text-white/50">
          💡 {item.notes}
        </p>
      )}
    </div>
  );
};

// ─── Loading screen ───────────────────────────────────────────────────────────
const LoadingScreen: React.FC<{ destination: string; msgIndex: number }> = ({ destination, msgIndex }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center text-3xl">✈️</div>
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-teal-400 mb-2">Building your trip</p>
      <h2 className="text-2xl font-black text-white">{destination}</h2>
    </div>
    <div className="h-12 flex items-center">
      <p key={msgIndex} className="text-sm text-white/60 animate-pulse transition-all">
        {LOADING_MESSAGES[msgIndex % LOADING_MESSAGES.length]}
      </p>
    </div>
    <div className="flex gap-1.5">
      {LOADING_MESSAGES.map((_, i) => (
        <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === msgIndex % LOADING_MESSAGES.length ? 'bg-teal-400 scale-125' : 'bg-white/20'}`} />
      ))}
    </div>
  </div>
);

// ─── Input screen ─────────────────────────────────────────────────────────────
interface InputScreenProps {
  form: TripPlanInput;
  setForm: React.Dispatch<React.SetStateAction<TripPlanInput>>;
  onSubmit: () => void;
  onDemo: () => void;
  loading: boolean;
}
const InputScreen: React.FC<InputScreenProps> = ({ form, setForm, onSubmit, onDemo, loading }) => {
  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5";
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/30">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white leading-tight">Where do you<br />want to go?</h1>
        <p className="mt-2 text-sm text-white/50">AI-powered trip planner. Flights, hotels, activities — all in one timeline.</p>
      </div>

      {/* Demo button */}
      <button onClick={onDemo}
        className="mb-6 w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 py-3 text-sm font-bold text-amber-300 transition-all hover:bg-amber-400/20 flex items-center justify-center gap-2">
        <Zap size={16} />Try Demo — Bali, 7 days (no API key needed)
      </button>

      {/* Form fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Destination</label>
            <input className={inputCls} placeholder="e.g. Bali, Tokyo, London"
              value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Flying from</label>
            <input className={inputCls} placeholder="e.g. London, NYC"
              value={form.originCity} onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Departure date</label>
            <input type="date" className={inputCls} value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Return date</label>
            <input type="date" className={inputCls} value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Travellers</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, travellers: Math.max(1, f.travellers - 1) }))}
              className="h-10 w-10 flex-shrink-0 rounded-xl border border-white/20 bg-white/5 text-lg font-bold text-white hover:bg-white/10">−</button>
            <span className="flex-1 text-center text-lg font-black text-white">{form.travellers}</span>
            <button onClick={() => setForm(f => ({ ...f, travellers: Math.min(12, f.travellers + 1) }))}
              className="h-10 w-10 flex-shrink-0 rounded-xl border border-white/20 bg-white/5 text-lg font-bold text-white hover:bg-white/10">+</button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Total budget</label>
          <div className="flex gap-2">
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-teal-400/50">
              {['USD', 'EUR', 'GBP', 'AED', 'LKR'].map(c => <option key={c} value={c} className="bg-[#07161d]">{c}</option>)}
            </select>
            <input type="number" className={`${inputCls} flex-1`} placeholder="3000"
              value={form.budget || ''} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Preferences <span className="text-white/30 normal-case font-normal">(optional)</span></label>
          <textarea rows={3} className={`${inputCls} resize-none`}
            placeholder="e.g. I love hiking, avoid touristy spots, mid-range budget, vegetarian food…"
            value={form.preferences || ''} onChange={e => setForm(f => ({ ...f, preferences: e.target.value }))} />
        </div>
        <button onClick={onSubmit} disabled={loading || !form.destination || !form.originCity || !form.startDate || !form.endDate}
          className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 py-4 text-base font-semibold text-black shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:scale-[1.01] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Building…</> : <><Sparkles size={18} />Build My Trip</>}
        </button>
      </div>
    </div>
  );
};

// ─── Plan header ──────────────────────────────────────────────────────────────
interface PlanHeaderProps {
  plan: TripPlan;
  items: PlanItem[];
  onEdit: () => void;
  onBookAll: () => void;
}
const PlanHeader: React.FC<PlanHeaderProps> = ({ plan, items, onEdit, onBookAll }) => {
  const totalCost = items.reduce((s, it) => s + (it.options[it.selectedOptionIndex]?.price ?? 0), 0);
  const pct = Math.min(100, Math.round((totalCost / plan.budget) * 100));
  const barColor = pct > 100 ? 'bg-red-500' : pct > 85 ? 'bg-amber-400' : 'bg-teal-500';
  const days = Math.round((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / 86_400_000);
  const startFmt = new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFmt = new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#07161d]/95 backdrop-blur-2xl px-4 py-3">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{plan.destination}</h2>
            <p className="text-xs text-white/50 mt-0.5">{startFmt} – {endFmt} · {days} days · {plan.travellers} traveller{plan.travellers > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black text-white">{fmtCurrency(totalCost, plan.budgetCurrency)}</p>
            <p className="text-[10px] text-white/40">of {fmtCurrency(plan.budget, plan.budgetCurrency)} budget</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px]">
          <span className={pct > 100 ? 'text-red-400' : pct > 85 ? 'text-amber-400' : 'text-teal-400'}>
            {pct > 100 ? `${pct - 100}% over budget` : `${100 - pct}% remaining`}
          </span>
          <span className="text-white/30">{items.length} items</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main view ────────────────────────────────────────────────────────────────
export const AIPlannerView: React.FC<AIPlannerViewProps> = ({ onBack }) => {
  type Step = 'input' | 'loading' | 'plan' | 'error';

  const defaultForm: TripPlanInput = {
    destination: '', originCity: '', budget: 2000, currency: 'USD', travellers: 2,
    startDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })(),
    endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString().split('T')[0]; })(),
    preferences: '',
  };

  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<TripPlanInput>(defaultForm);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRemoved, setLastRemoved] = useState<{ item: PlanItem; origItems: PlanItem[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoadingCycle = useCallback(() => {
    setLoadingMsgIdx(0);
    timerRef.current = setInterval(() => setLoadingMsgIdx(i => i + 1), 1600);
  }, []);

  const stopLoadingCycle = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => {
    stopLoadingCycle();
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, [stopLoadingCycle]);

  const runPlan = useCallback(async (input: TripPlanInput) => {
    setStep('loading');
    startLoadingCycle();
    try {
      const result = await generateTripPlan(input);
      setPlan(result);
      setItems(result.items);
      stopLoadingCycle();
      setStep('plan');
    } catch (e) {
      stopLoadingCycle();
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setStep('error');
    }
  }, [startLoadingCycle, stopLoadingCycle]);

  const handleSubmit = () => { if (form.destination && form.originCity) runPlan(form); };

  const handleDemo = () => {
    setForm(DEMO_PRESET);
    runPlan(DEMO_PRESET);
  };

  const handleSelectOption = useCallback((itemIndex: number, optionIndex: number) => {
    if (items[itemIndex]?.selectedOptionIndex === optionIndex) return;
    const updated = cascadeTimingChange(items, itemIndex, optionIndex);
    setItems(updated);
    // Highlight all affected items briefly
    const affected = Array.from({ length: updated.length - itemIndex }, (_, i) => itemIndex + i);
    affected.forEach((idx, i) => {
      setTimeout(() => setHighlightedIdx(idx), i * 80);
    });
    setTimeout(() => setHighlightedIdx(null), affected.length * 80 + 800);
  }, [items]);

  const handleRemove = useCallback((itemId: string) => {
    const itemIdx = items.findIndex(it => it.id === itemId);
    if (itemIdx === -1) return;
    const removedItem = items[itemIdx];
    const newItems = items.filter(it => it.id !== itemId);
    // Re-cascade timing from the position of the removed item
    let cascaded = newItems;
    if (itemIdx > 0 && itemIdx < newItems.length) {
      cascaded = [...newItems];
      for (let i = itemIdx; i < cascaded.length; i++) {
        const prev = cascaded[i - 1];
        const prevEndMs = prev.endAt
          ? new Date(prev.endAt).getTime()
          : new Date(prev.scheduledAt).getTime() + prev.durationMinutes * 60_000;
        const travelMs = (cascaded[i].travelTimeTo ?? 0) * 60_000;
        const newStart = prevEndMs + travelMs;
        const dur = cascaded[i].durationMinutes;
        cascaded[i] = {
          ...cascaded[i],
          scheduledAt: new Date(newStart).toISOString(),
          endAt: new Date(newStart + dur * 60_000).toISOString(),
        };
      }
    }
    setLastRemoved({ item: removedItem, origItems: items });
    setItems(cascaded);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setLastRemoved(null);
      undoTimerRef.current = null;
    }, 4000);
  }, [items]);

  const handleUndo = useCallback(() => {
    if (!lastRemoved) return;
    setItems(lastRemoved.origItems);
    setLastRemoved(null);
    if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
  }, [lastRemoved]);

  const handleBookAll = useCallback(() => {
    // No-op for now — could integrate with booking system
    alert('Booking integration coming soon! Each selected option would be confirmed through the TravelBook booking flow.');
  }, []);

  const handleEdit = () => {
    setStep('input');
    stopLoadingCycle();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col min-h-0">
      {/* Back button */}
      {step !== 'loading' && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
          <button onClick={step === 'plan' ? handleEdit : onBack}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors">
            <ChevronLeft size={14} />{step === 'plan' ? 'Edit Plan' : 'Back'}
          </button>
          {step === 'plan' && plan && (
            <span className="text-xs text-white/30">AI Trip Planner · {plan.destination}</span>
          )}
        </div>
      )}

      {/* ── INPUT ───────────────────────────────────────────────────────────── */}
      {step === 'input' && (
        <div className="flex-1 overflow-y-auto">
          <InputScreen form={form} setForm={setForm} onSubmit={handleSubmit} onDemo={handleDemo} loading={false} />
        </div>
      )}

      {/* ── LOADING ─────────────────────────────────────────────────────────── */}
      {step === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen destination={form.destination || 'your destination'} msgIndex={loadingMsgIdx} />
        </div>
      )}

      {/* ── ERROR ───────────────────────────────────────────────────────────── */}
      {step === 'error' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center py-12">
          <div className="text-5xl">😕</div>
          <h3 className="text-xl font-black text-white">Could not build your trip</h3>
          <p className="text-sm text-white/50 max-w-xs">{errorMsg}</p>
          <button onClick={() => setStep('input')}
            className="flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-6 py-3 text-sm font-semibold text-black">
            <RefreshCw size={14} />Try Again
          </button>
        </div>
      )}

      {/* ── PLAN VIEW ───────────────────────────────────────────────────────── */}
      {step === 'plan' && plan && (
        <div className="flex flex-1 flex-col min-h-0">
          <PlanHeader plan={plan} items={items} onEdit={handleEdit} onBookAll={handleBookAll} />
          {/* AI Summary */}
          <div className="px-4 py-3 mx-auto w-full max-w-lg flex-shrink-0">
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-teal-400 mb-1">AI Overview</p>
              <p className="text-xs text-white/65 leading-relaxed">{plan.aiSummary}</p>
            </div>
          </div>
          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-4 pb-32">
            <div className="mx-auto max-w-lg space-y-0">
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {item.category === 'transport' ? (
                    <TransportCard
                      item={item}
                      itemIndex={idx}
                      currency={plan.budgetCurrency}
                      onSelectOption={handleSelectOption}
                      onRemove={() => handleRemove(item.id)}
                    />
                  ) : (
                    <>
                      {idx > 0 && item.travelTimeTo ? <TravelConnector minutes={item.travelTimeTo} /> : <div className="h-2" />}
                      <PlanCard
                        item={item}
                        itemIndex={idx}
                        currency={plan.budgetCurrency}
                        highlightedIndex={highlightedIdx}
                        onSelectOption={handleSelectOption}
                        onRemove={!item.isRequired ? () => handleRemove(item.id) : undefined}
                      />
                    </>
                  )}
                </React.Fragment>
              ))}
              <div className="pt-4 pb-2 text-center">
                <p className="text-xs text-white/25">End of itinerary · {items.length} items planned</p>
              </div>
            </div>
          </div>

          {/* Undo snackbar */}
          {lastRemoved && (
            <div className="fixed bottom-36 left-1/2 z-50 -translate-x-1/2 pointer-events-auto">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-zinc-900/95 backdrop-blur-xl px-5 py-3 shadow-2xl">
                <span className="text-sm text-white/80">Removed</span>
                <span className="text-xs text-white/40 truncate max-w-[120px]">{lastRemoved.item.options[0]?.title ?? 'item'}</span>
                <button onClick={handleUndo}
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-3 py-1.5 text-xs font-semibold text-black transition-all">
                  Undo
                </button>
              </div>
            </div>
          )}
          {/* Bottom bar */}
          <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
            <div className="mx-auto max-w-lg pointer-events-auto">
              <div className="rounded-3xl border border-white/15 bg-[#07161d]/95 backdrop-blur-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
                <button onClick={handleEdit}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white">
                  <ChevronLeft size={13} />Edit Plan
                </button>
                <div className="text-center flex-1">
                  <p className="text-xs font-black text-white">
                    {fmtCurrency(items.reduce((s, it) => s + (it.options[it.selectedOptionIndex]?.price ?? 0), 0), plan.budgetCurrency)}
                  </p>
                  <p className="text-[9px] text-white/35">total estimated</p>
                </div>
                <button onClick={handleBookAll}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-semibold text-black shadow-lg shadow-teal-500/30">
                  Book All<ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlannerView;
