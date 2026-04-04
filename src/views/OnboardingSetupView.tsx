'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Compass,
  Link2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import {
  ACCOUNT_GOALS,
  ACCOUNT_LABEL_BY_TYPE,
  ACCOUNT_TYPE_OPTIONS,
  INTEGRATION_OPTIONS,
  MEMBERSHIP_TIER_OPTIONS,
  PROVIDER_CATEGORY_BY_TYPE,
  PROVIDER_TYPE_OPTIONS,
  SUPPLIER_CATEGORY_BY_TYPE,
  SUPPLIER_TYPE_OPTIONS,
  TRAVELER_STYLE_OPTIONS,
} from '@/onboardingConfig';
import { MembershipBadge } from '@/components/MembershipBadge';
import { resolveIdentityLabel } from '@/services/identityService';
import { isHotelInvite, isProviderInvite, TravelBookInviteContext } from '@/services/providerInviteService';
import { AccountType, IntegrationPreference, MembershipTier, ProviderType, SupplierType, User } from '@/types';

interface OnboardingSetupViewProps {
  user: User;
  onComplete: (user: User) => void;
  onCancel: () => void;
  invitationContext?: TravelBookInviteContext | null;
}

const STEP_TITLES = ['Account Type', 'Profile Setup', 'Goals'];

const normalizeHandle = (value: string) => {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned ? `@${cleaned}` : '@travel_book_user';
};

export const OnboardingSetupView: React.FC<OnboardingSetupViewProps> = ({ user, onComplete, onCancel, invitationContext }) => {
  const providerInvite = isProviderInvite(invitationContext);
  const hotelInvite = isHotelInvite(invitationContext);
  const [step, setStep] = useState(() => (providerInvite ? 1 : 0));
  const [accountType, setAccountType] = useState<AccountType>(invitationContext?.accountType || user.accountType || 'traveler');
  const lockedProviderType = accountType === 'provider' && Boolean(invitationContext?.providerType);
  const [displayName, setDisplayName] = useState(user.name || '');
  const [companyName, setCompanyName] = useState(invitationContext?.companyName || user.companyName || '');
  const [username, setUsername] = useState(user.username || '');
  const [locationBase, setLocationBase] = useState(invitationContext?.locationBase || user.locationBase || '');
  const [contactEmail, setContactEmail] = useState(invitationContext?.contactEmail || user.contactEmail || '');
  const [website, setWebsite] = useState(invitationContext?.website || user.website || '');
  const [bio, setBio] = useState(user.bio || '');
  const [travelerStyle, setTravelerStyle] = useState(user.category || TRAVELER_STYLE_OPTIONS[0]);
  const [providerType, setProviderType] = useState<ProviderType>(invitationContext?.providerType || user.providerType || 'hotel');
  const [supplierType, setSupplierType] = useState<SupplierType>(user.supplierType || 'inventory_partner');
  const [integrationPreference, setIntegrationPreference] = useState<IntegrationPreference>(invitationContext?.integrationPreference || user.integrationPreference || 'manual');
  const [goals, setGoals] = useState<string[]>(user.onboardingGoals || []);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(invitationContext?.membershipTier || user.membershipTier || 'standard');

  const selectedGoals = useMemo(() => ACCOUNT_GOALS[accountType], [accountType]);

  const stepTwoReady = useMemo(() => {
    if (accountType === 'traveler') {
      return Boolean(displayName.trim() && username.trim());
    }

    return Boolean(companyName.trim() && username.trim() && locationBase.trim() && contactEmail.trim());
  }, [accountType, companyName, contactEmail, displayName, locationBase, username]);

  const toggleGoal = (goal: string) => {
    setGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal],
    );
  };

  const completeOnboarding = () => {
    const finalName = accountType === 'traveler' ? displayName.trim() : companyName.trim();
    const finalUsername = normalizeHandle(username || finalName);
    const finalBio =
      bio.trim() ||
      (accountType === 'traveler'
        ? 'Sharing travel ideas, plans, and memorable journeys.'
        : accountType === 'provider'
          ? 'Helping travelers discover, trust, and book great experiences.'
          : 'Supporting travel businesses with inventory, systems, and supply operations.');

    const finalCategory =
      accountType === 'traveler'
        ? travelerStyle
        : accountType === 'provider'
          ? PROVIDER_CATEGORY_BY_TYPE[providerType]
          : SUPPLIER_CATEGORY_BY_TYPE[supplierType];

    onComplete({
      ...user,
      name: finalName || user.name || ACCOUNT_LABEL_BY_TYPE[accountType],
      username: finalUsername,
      avatar: user.avatar || `https://picsum.photos/seed/${encodeURIComponent(finalUsername)}/200`,
      bio: finalBio,
      isBusiness: accountType !== 'traveler',
      accountType,
      category: finalCategory,
      companyName: accountType === 'traveler' ? undefined : finalName,
      providerType: accountType === 'provider' ? providerType : undefined,
      supplierType: accountType === 'supplier' ? supplierType : undefined,
      locationBase: locationBase.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      website: website.trim() || undefined,
      integrationPreference: accountType === 'traveler' ? undefined : integrationPreference,
      membershipTier,
      onboardingGoals: goals.length > 0 ? goals : selectedGoals.slice(0, 2),
      onboardingCompleted: true,
    });
  };

  const handleBack = () => {
    if (step === 0 || (step === 1 && providerInvite)) {
      onCancel();
      return;
    }

    setStep((currentStep) => currentStep - 1);
  };

  return (
    <div className="w-full max-w-4xl">
      <GlassCard className="overflow-hidden border-white/10 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="grid lg:grid-cols-[1.1fr,1.4fr]">
          <div className="border-b border-white/10 bg-gradient-to-br from-amber-300/15 via-transparent to-transparent p-8 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
              <Sparkles size={14} />
              Registration and onboarding
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-white">Set up your account for the marketplace.</h2>
              <p className="text-base leading-relaxed text-white/70">
                Travelers can share and book. Providers can sell through their page. Suppliers can connect inventory and systems into the platform.
              </p>
            </div>

            {invitationContext && (
              <div className="mt-6 rounded-[1.8rem] border border-sky-300/20 bg-sky-400/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-100/85">Travel Book Partnerships</p>
                <p className="mt-2 text-lg font-black text-white">
                  {hotelInvite ? 'Your hotel page is already reserved.' : 'Your invited page setup is ready.'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {invitationContext.companyName
                    ? `${invitationContext.companyName} can move straight into profile setup without choosing a different account path.`
                    : 'This invitation pre-fills your page setup so your team can get live faster.'}
                </p>
                <div className="mt-4 space-y-2 text-sm text-white/75">
                  {invitationContext.contactEmail && <p><span className="text-white">Contact:</span> {invitationContext.contactEmail}</p>}
                  {invitationContext.locationBase && <p><span className="text-white">Market:</span> {invitationContext.locationBase}</p>}
                  {invitationContext.integrationPreference && <p><span className="text-white">Setup path:</span> {invitationContext.integrationPreference.replace('_', ' ')}</p>}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {STEP_TITLES.map((title, index) => {
                const isActive = index === step;
                const isComplete = index < step;

                return (
                  <div
                    key={title}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                      isActive
                        ? 'border-amber-300/30 bg-amber-300/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/55'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                        isComplete || isActive ? 'bg-white text-slate-950' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {isComplete ? <Check size={14} /> : index + 1}
                    </div>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step 1</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">Choose your account type</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    You can start simple now and expand later. This just helps the app show the right setup path.
                  </p>
                </div>

                <div className="grid gap-4">
                  {ACCOUNT_TYPE_OPTIONS.map((option) => {
                    const isSelected = option.id === accountType;
                    const Icon =
                      option.id === 'traveler'
                        ? Compass
                        : option.id === 'provider'
                          ? Store
                          : Building2;

                    return (
                      <button
                        key={option.id}
                        onClick={() => setAccountType(option.id)}
                        disabled={providerInvite && option.id !== accountType}
                        className={`rounded-[1.8rem] border p-5 text-left transition-all ${
                          isSelected
                            ? 'border-amber-300/35 bg-amber-300/10 text-white'
                            : providerInvite && option.id !== accountType
                              ? 'border-white/10 bg-white/5 text-white/35'
                              : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-2xl p-3 ${isSelected ? 'bg-white text-slate-950' : 'bg-white/10 text-white'}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black tracking-tight">{option.title}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-white/65">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step 2</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
                    {accountType === 'traveler' ? 'Create your profile' : 'Set up your page details'}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {hotelInvite
                      ? 'Your invitation already selected a hotel provider page. Add the main details now, then connect rates and rooms next.'
                      : 'Add the basics now. We can expand this later with verification, payouts, and system connections.'}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {accountType === 'traveler' ? (
                    <>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Display name</span>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(event) => setDisplayName(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Handle</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="@your_handle"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Travel style</span>
                        <select
                          value={travelerStyle}
                          onChange={(event) => setTravelerStyle(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                        >
                          {TRAVELER_STYLE_OPTIONS.map((option) => (
                            <option key={option} value={option} className="bg-slate-900">
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Home base</span>
                        <input
                          type="text"
                          value={locationBase}
                          onChange={(event) => setLocationBase(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="Colombo, Sri Lanka"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                          {accountType === 'provider' ? 'Business name' : 'Company name'}
                        </span>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder={accountType === 'provider' ? 'Lanka Trail Stays' : 'South Asia Channel Connect'}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Handle</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="@your_page"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                          {accountType === 'provider' ? 'Provider type' : 'Supplier type'}
                        </span>
                        <select
                          value={accountType === 'provider' ? providerType : supplierType}
                          onChange={(event) =>
                            accountType === 'provider'
                              ? setProviderType(event.target.value as ProviderType)
                              : setSupplierType(event.target.value as SupplierType)
                          }
                          disabled={lockedProviderType}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {(accountType === 'provider' ? PROVIDER_TYPE_OPTIONS : SUPPLIER_TYPE_OPTIONS).map((option) => (
                            <option key={option.id} value={option.id} className="bg-slate-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Base location</span>
                        <input
                          type="text"
                          value={locationBase}
                          onChange={(event) => setLocationBase(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="Colombo, Sri Lanka"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Contact email</span>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(event) => setContactEmail(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="hello@yourbusiness.com"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Website</span>
                        <input
                          type="text"
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                          placeholder="https://yourbusiness.com"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Integration preference</span>
                        <select
                          value={integrationPreference}
                          onChange={(event) => setIntegrationPreference(event.target.value as IntegrationPreference)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                        >
                          {INTEGRATION_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id} className="bg-slate-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>

                <label className="space-y-2">
                  <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    {accountType === 'traveler' ? 'Bio' : 'About your business'}
                  </span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                    placeholder={
                      accountType === 'traveler'
                        ? 'Tell people what kind of travel experiences you love.'
                        : 'Explain what you offer and how travelers or partners should work with you.'
                    }
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step 3</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">Pick your first goals</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    These help us tailor the app around your first use case and the badge tier you want to start with.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Membership tier</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {MEMBERSHIP_TIER_OPTIONS.map((option) => {
                      const isSelected = option.id === membershipTier;
                      const selectedClasses =
                        option.id === 'gold'
                          ? 'border-amber-300/35 bg-amber-300/10 text-white'
                          : option.id === 'premium'
                            ? 'border-sky-300/35 bg-sky-400/10 text-white'
                            : 'border-white/20 bg-white/10 text-white';

                      return (
                        <button
                          key={option.id}
                          onClick={() => setMembershipTier(option.id)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected ? selectedClasses : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MembershipBadge tier={option.id} showStandard compact />
                            <span className="font-black">{option.title}</span>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-white/60">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3">
                  {selectedGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                        goals.includes(goal)
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {goal.includes('book') ? <Briefcase size={18} /> : goal.includes('Connect') || goal.includes('Sync') ? <Link2 size={18} /> : goal.includes('reviews') ? <ShieldCheck size={18} /> : goal.includes('Follow') ? <Users size={18} /> : <MapPin size={18} />}
                        <span className="font-semibold">{goal}</span>
                      </div>
                      {goals.includes(goal) && <Check size={18} />}
                    </button>
                  ))}
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Account summary</p>
                  <div className="mt-3 space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white">Type:</span> {ACCOUNT_LABEL_BY_TYPE[accountType]}
                    </p>
                    <p>
                      <span className="text-white">Identity:</span> {resolveIdentityLabel({ accountType })}
                    </p>
                    <p>
                      <span className="text-white">Profile name:</span> {accountType === 'traveler' ? displayName || 'Traveler profile' : companyName || 'Business profile'}
                    </p>
                    <p>
                      <span className="text-white">Handle:</span> {normalizeHandle(username || displayName || companyName)}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white">Membership:</span>
                      <MembershipBadge tier={membershipTier} showStandard compact />
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/70 transition-all hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                {step === 0 || (step === 1 && providerInvite) ? 'Back to sign in' : 'Back'}
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep((currentStep) => currentStep + 1)}
                  disabled={step === 1 && !stepTwoReady}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-all hover:scale-[1.01]"
                >
                  Finish setup
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
