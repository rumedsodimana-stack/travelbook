import { MembershipTier, User } from '@/types';
import { TravelBookInviteContext } from '@/services/providerInviteService';

interface CompanyOsInviteContext {
  inviteId: string; inviteToken: string; source: 'company_os'; accountType: 'provider';
  providerType: 'hotel' | 'flight' | 'transport' | 'event' | 'tour' | 'entertainment';
  companyName: string; contactName: string; contactEmail: string; locationBase: string;
  market: string; integrationPreference: 'manual' | 'channel_manager' | 'direct_api' | 'csv_upload';
}

interface CompanyOsProviderRecord {
  id: string; invitationId?: string; onboardingStage: string; listingStatus: string;
  contactEmail?: string; membershipTier?: MembershipTier;
}

interface CompanyOsProviderResponse { inviteContext: CompanyOsInviteContext; provider?: CompanyOsProviderRecord; }

const COMPANY_OS_API_BASE_URL =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_COMPANY_OS_API_BASE_URL : '')?.replace(/\/$/, '') || 'http://127.0.0.1:3001';

const postCompanyOs = async <T>(path: string, payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${COMPANY_OS_API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'The onboarding service is unavailable right now.');
  return data;
};

const ensureInviteToken = (ctx: TravelBookInviteContext) => {
  if (!ctx.inviteId || !ctx.inviteToken) throw new Error('The invitation link is incomplete.');
  return { inviteId: ctx.inviteId, inviteToken: ctx.inviteToken };
};

const mapInviteContext = (ic: CompanyOsInviteContext): TravelBookInviteContext => ({
  inviteId: ic.inviteId, inviteToken: ic.inviteToken, source: ic.source, accountType: ic.accountType,
  providerType: ic.providerType, companyName: ic.companyName, contactName: ic.contactName,
  contactEmail: ic.contactEmail, locationBase: ic.locationBase, market: ic.market,
  integrationPreference: ic.integrationPreference,
});

export const validateTravelBookProviderInvitation = async (invitationContext: TravelBookInviteContext) => {
  const data = await postCompanyOs<CompanyOsProviderResponse>('/api/public/provider-onboarding/validate', ensureInviteToken(invitationContext));
  return { invitationContext: mapInviteContext(data.inviteContext), providerId: data.provider?.id, provider: data.provider };
};

export const registerTravelBookProviderAccount = async ({ invitationContext, email, membershipTier }: { invitationContext: TravelBookInviteContext; email: string; membershipTier: MembershipTier }) => {
  const data = await postCompanyOs<CompanyOsProviderResponse>('/api/public/provider-onboarding/register', {
    ...ensureInviteToken(invitationContext), companyName: invitationContext.companyName,
    contactName: invitationContext.contactName, contactEmail: email, membershipTier, website: invitationContext.website,
  });
  return { invitationContext: mapInviteContext(data.inviteContext), providerId: data.provider?.id, provider: data.provider };
};

export const syncTravelBookProviderAccount = async (user: User) => {
  if (!user.providerInvitationId || !user.providerInvitationToken) throw new Error('Provider invitation information is missing.');
  const data = await postCompanyOs<CompanyOsProviderResponse>('/api/public/provider-onboarding/sync', {
    inviteId: user.providerInvitationId, inviteToken: user.providerInvitationToken,
    providerId: user.backendProviderId, companyName: user.companyName || user.name,
    contactEmail: user.contactEmail, locationBase: user.locationBase, website: user.website,
    membershipTier: user.membershipTier, integrationPreference: user.integrationPreference,
    travelBookUserId: user.id, travelBookUsername: user.username, bio: user.bio,
    onboardingCompleted: user.onboardingCompleted,
    providerPage: user.providerPage ? {
      headline: user.providerPage.headline, summary: user.providerPage.summary,
      setupStage: user.providerPage.setupStage, connectionStatus: user.providerPage.connectionStatus,
      connectionLabel: user.providerPage.connectionLabel, directBookingEnabled: user.providerPage.directBookingEnabled,
      payoutReady: user.providerPage.payoutReady, contentScore: user.providerPage.contentScore,
      roomTypes: (user.providerPage.roomTypes || []).map((room) => ({
        id: room.id, name: room.name, nightlyRate: room.nightlyRate, inventory: room.inventory,
        capacity: room.capacity, status: room.status, highlights: room.highlights,
      })),
    } : undefined,
  });
  return { invitationContext: mapInviteContext(data.inviteContext), providerId: data.provider?.id, provider: data.provider };
};
