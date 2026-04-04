import { AccountType, IntegrationPreference, MembershipTier, ProviderType } from '@/types';

export interface TravelBookInviteContext {
  inviteId?: string;
  inviteToken?: string;
  source?: string;
  accountType?: AccountType;
  membershipTier?: MembershipTier;
  providerType?: ProviderType;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  locationBase?: string;
  market?: string;
  integrationPreference?: IntegrationPreference;
  website?: string;
}

const ACCOUNT_TYPES: readonly AccountType[] = ['traveler', 'provider', 'supplier'];
const MEMBERSHIP_TIERS: readonly MembershipTier[] = ['standard', 'premium', 'gold'];
const PROVIDER_TYPES: readonly ProviderType[] = ['hotel', 'flight', 'transport', 'event', 'tour', 'entertainment', 'other'];
const INTEGRATION_PREFERENCES: readonly IntegrationPreference[] = ['manual', 'channel_manager', 'direct_api', 'csv_upload'];

const INVITE_QUERY_KEYS = ['inviteId', 'inviteToken', 'source', 'accountType', 'membershipTier', 'providerType', 'companyName', 'contactName', 'email', 'contactEmail', 'locationBase', 'market', 'integrationPreference', 'website'] as const;

const readParam = (params: URLSearchParams, key: string) => { const value = params.get(key)?.trim(); return value ? value : undefined; };
const readFirstParam = (params: URLSearchParams, keys: string[]) => { for (const key of keys) { const value = readParam(params, key); if (value) return value; } return undefined; };
const parseEnum = <T extends string>(value: string | undefined, allowed: readonly T[]) => { if (!value) return undefined; return allowed.includes(value as T) ? (value as T) : undefined; };

export const getTravelBookInviteContext = (): TravelBookInviteContext | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const inviteId = readParam(params, 'inviteId');
  const source = readParam(params, 'source');
  const accountType = parseEnum(readParam(params, 'accountType'), ACCOUNT_TYPES);
  const providerType = parseEnum(readParam(params, 'providerType'), PROVIDER_TYPES);
  const companyName = readParam(params, 'companyName');
  const contactEmail = readFirstParam(params, ['email', 'contactEmail']);
  const hasInviteSignal = Boolean(inviteId || source === 'company_os' || accountType || providerType || companyName || contactEmail);
  if (!hasInviteSignal) return null;
  return {
    inviteId, inviteToken: readParam(params, 'inviteToken'), source, accountType,
    membershipTier: parseEnum(readParam(params, 'membershipTier'), MEMBERSHIP_TIERS),
    providerType, companyName, contactName: readParam(params, 'contactName'), contactEmail,
    locationBase: readFirstParam(params, ['locationBase', 'market']),
    market: readParam(params, 'market'),
    integrationPreference: parseEnum(readParam(params, 'integrationPreference'), INTEGRATION_PREFERENCES),
    website: readParam(params, 'website'),
  };
};

export const clearTravelBookInviteContext = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  INVITE_QUERY_KEYS.forEach((key) => url.searchParams.delete(key));
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', nextUrl || '/');
};

export const isProviderInvite = (context: TravelBookInviteContext | null | undefined) => context?.accountType === 'provider';
export const isHotelInvite = (context: TravelBookInviteContext | null | undefined) => isProviderInvite(context) && context?.providerType === 'hotel';
