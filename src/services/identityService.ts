import { MembershipTier, User } from '@/types';
import { ensureProviderPage } from '@/services/providerPageService';

export const resolveAccountType = (user: Pick<User, 'accountType' | 'isBusiness'>) => {
  if (user.accountType) return user.accountType;
  return user.isBusiness ? 'provider' : 'traveler';
};

export const resolveMembershipTier = (user: Pick<User, 'membershipTier'> | undefined): MembershipTier => {
  return user?.membershipTier || 'standard';
};

export const resolveIdentityKind = (user: Pick<User, 'accountType' | 'isBusiness'>) => {
  return resolveAccountType(user) === 'traveler' ? 'profile' : 'page';
};

export const resolveIdentityLabel = (user: Pick<User, 'accountType' | 'isBusiness'>) => {
  const accountType = resolveAccountType(user);
  if (accountType === 'provider') return 'Provider Page';
  if (accountType === 'supplier') return 'Supplier Page';
  return 'Traveler Profile';
};

export const resolveMembershipBadgeTone = (tier: MembershipTier) => {
  if (tier === 'gold') return 'gold';
  if (tier === 'premium') return 'blue';
  return 'none';
};

export const getMembershipLabel = (tier: MembershipTier) => {
  if (tier === 'gold') return 'Gold';
  if (tier === 'premium') return 'Premium';
  return 'Standard';
};

export const hydrateTravelBookUser = (user: User): User => {
  const accountType = resolveAccountType(user);
  const isBusiness = accountType !== 'traveler';
  return {
    ...user, accountType, isBusiness,
    membershipTier: resolveMembershipTier(user),
    companyName: isBusiness ? user.companyName || user.name : undefined,
    providerPage: ensureProviderPage({ ...user, accountType, isBusiness }),
  };
};
