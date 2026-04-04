import { hydrateTravelBookUser } from '@/services/identityService';
import { AccountType, MembershipTier, User } from '@/types';

interface StoredAccount { email: string; password: string; user: User; createdAt: string; updatedAt: string; }
interface SessionRecord { userId: string; }
interface RegisterAccountInput { email: string; password: string; accountType: AccountType; membershipTier: MembershipTier; seedUser?: Partial<User>; }
interface AuthResult { ok: boolean; user?: User; error?: string; }

const ACCOUNTS_STORAGE_KEY = 'travel_book_accounts_v1';
const SESSION_STORAGE_KEY = 'travel_book_session_v1';

const DEMO_ACCOUNT: StoredAccount = {
  email: 'traveler@demo.com', password: 'password123',
  createdAt: '2026-04-01T09:00:00.000Z', updatedAt: '2026-04-01T09:00:00.000Z',
  user: hydrateTravelBookUser({
    id: 'demo-user-123', name: 'Demo Traveler', username: '@demo_traveler',
    avatar: 'https://picsum.photos/seed/demo-traveler/200', accountType: 'traveler',
    membershipTier: 'premium', category: 'Traveler', isBusiness: false,
    bio: 'Planning a city break and saving ideas for the next trip.',
    contactEmail: 'traveler@demo.com', onboardingCompleted: true,
  }),
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readAccounts = (): StoredAccount[] => {
  if (!canUseStorage()) return [DEMO_ACCOUNT];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    return ensureSeedAccounts(parsed);
  } catch { return ensureSeedAccounts([]); }
};

const writeAccounts = (accounts: StoredAccount[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

const ensureSeedAccounts = (accounts: StoredAccount[]) => {
  const normalized = accounts.map((account) => ({
    ...account, email: account.email.toLowerCase(),
    user: hydrateTravelBookUser(account.user),
  }));
  if (!normalized.some((account) => account.email === DEMO_ACCOUNT.email)) normalized.unshift(DEMO_ACCOUNT);
  if (canUseStorage()) window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeBaseName = (email: string) => email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Travel Book User';
const normalizeHandle = (email: string) => {
  const cleaned = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `@${cleaned || 'travel_book_user'}`;
};

export const registerTravelBookAccount = ({ email, password, accountType, membershipTier, seedUser }: RegisterAccountInput): AuthResult => {
  const safeEmail = normalizeEmail(email);
  const safePassword = password.trim();
  if (!safeEmail) return { ok: false, error: 'Please enter an email address.' };
  if (safePassword.length < 6) return { ok: false, error: 'Use a password with at least 6 characters.' };
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === safeEmail)) return { ok: false, error: 'An account with that email already exists.' };

  const timestamp = new Date().toISOString();
  const seededName = seedUser?.companyName || seedUser?.name || normalizeBaseName(safeEmail);
  const seededHandleSource = seedUser?.username || seedUser?.companyName || seedUser?.name || safeEmail;
  const user = hydrateTravelBookUser({
    id: `account-${Date.now()}`, name: seededName,
    username: seedUser?.username || normalizeHandle(seededHandleSource),
    avatar: seedUser?.avatar || `https://picsum.photos/seed/${encodeURIComponent(safeEmail)}/200`,
    accountType, membershipTier,
    category: seedUser?.category || (accountType === 'traveler' ? 'Traveler' : accountType === 'provider' ? 'Travel Provider' : 'Supplier'),
    isBusiness: accountType !== 'traveler', bio: seedUser?.bio || '',
    companyName: accountType === 'traveler' ? undefined : seedUser?.companyName,
    providerType: accountType === 'provider' ? seedUser?.providerType : undefined,
    supplierType: accountType === 'supplier' ? seedUser?.supplierType : undefined,
    locationBase: seedUser?.locationBase, website: seedUser?.website,
    contactEmail: seedUser?.contactEmail || safeEmail,
    integrationPreference: accountType === 'traveler' ? undefined : seedUser?.integrationPreference,
    onboardingGoals: seedUser?.onboardingGoals, onboardingCompleted: false,
    backendProviderId: seedUser?.backendProviderId,
    providerInvitationId: seedUser?.providerInvitationId,
    providerInvitationToken: seedUser?.providerInvitationToken,
  });

  accounts.unshift({ email: safeEmail, password: safePassword, user, createdAt: timestamp, updatedAt: timestamp });
  writeAccounts(accounts);
  persistTravelBookSession(user);
  return { ok: true, user };
};

export const loginTravelBookAccount = (email: string, password: string): AuthResult => {
  const safeEmail = normalizeEmail(email);
  const accounts = readAccounts();
  const account = accounts.find((entry) => entry.email === safeEmail);
  if (!account || account.password !== password) return { ok: false, error: 'Email or password did not match.' };
  const hydratedUser = hydrateTravelBookUser(account.user);
  persistTravelBookSession(hydratedUser);
  return { ok: true, user: hydratedUser };
};

export const persistTravelBookSession = (user: User) => {
  if (!canUseStorage()) return;
  const session: SessionRecord = { userId: user.id };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearTravelBookSession = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getPersistedTravelBookSession = (): User | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionRecord;
    const account = readAccounts().find((entry) => entry.user.id === session.userId);
    if (!account) { clearTravelBookSession(); return null; }
    return hydrateTravelBookUser(account.user);
  } catch { clearTravelBookSession(); return null; }
};

export const updateStoredTravelBookUser = (user: User) => {
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.user.id === user.id);
  if (index === -1) { persistTravelBookSession(user); return hydrateTravelBookUser(user); }
  const nextUser = hydrateTravelBookUser(user);
  accounts[index] = { ...accounts[index], user: nextUser, email: normalizeEmail(nextUser.contactEmail || accounts[index].email), updatedAt: new Date().toISOString() };
  writeAccounts(accounts);
  persistTravelBookSession(nextUser);
  return nextUser;
};
