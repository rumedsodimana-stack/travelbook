'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { ACCOUNT_TYPE_OPTIONS, MEMBERSHIP_TIER_OPTIONS } from '@/config/onboarding';
import { MembershipBadge } from '@/components/MembershipBadge';
import { loginTravelBookAccount, registerTravelBookAccount } from '@/services/accountService';
import { isHotelInvite, isProviderInvite, TravelBookInviteContext } from '@/services/providerInviteService';
import { registerTravelBookProviderAccount } from '@/services/providerOnboardingApiService';
import { AccountType, MembershipTier, User } from '@/types';
import { LogIn, UserPlus, Mountain, Sparkles, Mail, ArrowLeft, Chrome, Apple } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthViewProps {
  onLogin: (user: User) => void;
  invitationContext?: TravelBookInviteContext | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, invitationContext }) => {
  const [mode, setMode] = useState<AuthMode>(() => invitationContext ? 'register' : 'login');
  const [email, setEmail] = useState(() => invitationContext?.contactEmail || '');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(() => invitationContext?.accountType || 'traveler');
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(() => invitationContext?.membershipTier || 'standard');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';
  const providerInvite = isProviderInvite(invitationContext);
  const hotelInvite = isHotelInvite(invitationContext);

  useEffect(() => {
    if (!invitationContext) return;
    setMode('register');
    setEmail(invitationContext.contactEmail || '');
    setAccountType(invitationContext.accountType || 'provider');
    setMembershipTier(invitationContext.membershipTier || 'standard');
  }, [invitationContext]);

  const inviteTitle = useMemo(() => {
    if (!invitationContext) return '';
    if (hotelInvite) return 'Hotel invitation from Travel Book Partnerships';
    if (providerInvite) return 'Provider invitation from Travel Book Partnerships';
    return 'Invitation from Travel Book Partnerships';
  }, [hotelInvite, invitationContext, providerInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isForgot) {
      setIsSubmitting(true);
      await new Promise(r => setTimeout(r, 1000));
      setForgotSent(true);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = loginTravelBookAccount(email, password);
        if (!result.ok || !result.user) {
          setErrorMessage(result.error || 'Email or password did not match.');
          return;
        }
        onLogin(result.user);
        return;
      }

      let backendProviderId: string | undefined;
      let resolvedInvitation = invitationContext;

      if (providerInvite && invitationContext) {
        const backendRegistration = await registerTravelBookProviderAccount({
          invitationContext,
          email,
          membershipTier,
        });
        backendProviderId = backendRegistration.providerId;
        resolvedInvitation = backendRegistration.invitationContext;
      }

      const result = registerTravelBookAccount({
        email,
        password,
        accountType,
        membershipTier,
        seedUser: resolvedInvitation
          ? {
              name: resolvedInvitation.contactName || resolvedInvitation.companyName,
              companyName: resolvedInvitation.companyName,
              contactEmail: email,
              locationBase: resolvedInvitation.locationBase,
              website: resolvedInvitation.website,
              providerType: resolvedInvitation.providerType,
              integrationPreference: resolvedInvitation.integrationPreference,
              backendProviderId,
              providerInvitationId: resolvedInvitation.inviteId,
              providerInvitationToken: resolvedInvitation.inviteToken,
            }
          : undefined,
      });

      if (!result.ok || !result.user) {
        setErrorMessage(result.error || 'Unable to create your account right now.');
        return;
      }
      onLogin(result.user);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    const demoEmail = 'traveler@demo.com';
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage('');
    const result = loginTravelBookAccount(demoEmail, 'password123');
    if (!result.ok || !result.user) {
      setErrorMessage(result.error || 'Demo account login failed.');
      return;
    }
    onLogin(result.user);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage('');
    setForgotSent(false);
  };

  return (
    <div className="relative z-10 w-full max-w-md px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 mb-4 shadow-xl">
          <Mountain className="text-white" size={48} />
        </div>
        <h1 className="font-logo text-6xl text-white mb-2 drop-shadow-2xl">Travel Book</h1>
        <p className="text-white/80 text-center text-lg px-4">
          Travelers, providers, and suppliers in one social travel marketplace.
        </p>
      </div>

      <GlassCard className="p-8">
        {/* Forgot password — back link */}
        {isForgot && (
          <button
            onClick={() => switchMode('login')}
            className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </button>
        )}

        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        {/* Invitation banner */}
        {invitationContext && !isForgot && (
          <div className="mb-5 rounded-[1.6rem] border border-sky-300/20 bg-sky-400/10 px-5 py-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200/80">Invited setup</p>
            <p className="mt-2 text-sm font-semibold text-white">{inviteTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {invitationContext.companyName
                ? `${invitationContext.companyName} can continue straight into page setup after registration.`
                : 'Your business can continue straight into page setup after registration.'}
            </p>
          </div>
        )}

        {/* Forgot password success state */}
        {isForgot && forgotSent ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center">
              <Mail className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-white font-black text-lg">Check your inbox</p>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">
                We sent a reset link to <span className="text-white font-bold">{email}</span>. Follow the instructions to set a new password.
              </p>
            </div>
            <button
              onClick={() => switchMode('login')}
              className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {!isForgot && (
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
              )}

              {/* Register-only fields */}
              {mode === 'register' && (
                <div className="space-y-3 pt-1">
                  <p className="text-white/45 text-[10px] uppercase font-black tracking-[0.2em] ml-1">Register as</p>
                  <div className="grid gap-3">
                    {ACCOUNT_TYPE_OPTIONS.map((option) => {
                      const isSelected = accountType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAccountType(option.id)}
                          disabled={providerInvite && option.id !== accountType}
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                            isSelected
                              ? 'border-amber-300/35 bg-amber-300/10 text-white'
                              : providerInvite && option.id !== accountType
                                ? 'border-white/10 bg-white/5 text-white/35'
                                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <p className="text-sm font-black">{option.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-white/60">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-white/45 text-[10px] uppercase font-black tracking-[0.2em] ml-1">Membership</p>
                    <div className="grid gap-3">
                      {MEMBERSHIP_TIER_OPTIONS.map((option) => {
                        const isSelected = membershipTier === option.id;
                        const selectedClasses =
                          option.id === 'gold'
                            ? 'border-amber-300/35 bg-amber-300/10 text-white'
                            : option.id === 'premium'
                              ? 'border-sky-300/35 bg-sky-400/10 text-white'
                              : 'border-white/20 bg-white/10 text-white';
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setMembershipTier(option.id)}
                            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                              isSelected ? selectedClasses : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <MembershipBadge tier={option.id} showStandard compact />
                              <div>
                                <p className="text-sm font-black">{option.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-white/60">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isForgot ? (
                    isSubmitting ? 'Sending...' : <><Mail size={18} /> Send Reset Link</>
                  ) : isLogin ? (
                    isSubmitting ? 'Logging in...' : <><LogIn size={20} /> Login</>
                  ) : (
                    isSubmitting ? 'Please wait...' : <><UserPlus size={20} /> {hotelInvite ? 'Continue to hotel setup' : 'Continue To Setup'}</>
                  )}
                </button>

                {/* Social login buttons — login/register only */}
                {!isForgot && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">or continue with</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Chrome size={16} /> Google
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Apple size={16} /> Apple
                      </button>
                    </div>
                  </>
                )}

                {isLogin && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Try Demo Account
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              {!isForgot && (
                <button
                  onClick={() => switchMode(isLogin ? 'register' : 'login')}
                  className="text-white/70 hover:text-white text-sm underline-offset-4 hover:underline transition-all"
                >
                  {isLogin ? 'Need an account? Register here' : 'Already have an account? Login'}
                </button>
              )}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
};
