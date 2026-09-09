import {
  AppBootstrap,
  Booking,
  Chat,
  Notification,
  Post,
  UpdateProfilePayload,
  User,
} from '@/types';
import { generateMockPost, generateMockUser, getMassiveFeed } from '@/services/dataFactory';
import { getPersistedTravelBookSession, updateStoredTravelBookUser } from '@/services/accountService';

const TRENDING_DESTINATIONS = [
  'Kyoto, Japan',
  'Santorini, Greece',
  'Reykjavik, Iceland',
  'Patagonia, Chile',
  'Marrakesh, Morocco',
  'Banff, Canada',
];

const BOOKING_SEEDS: Array<Pick<Booking, 'type' | 'title' | 'subtitle' | 'date' | 'status' | 'price' | 'details'>> = [
  {
    type: 'flight',
    title: 'Colombo → Tokyo Haneda',
    subtitle: 'SriLankan Airlines · UL454',
    date: '2026-09-14',
    status: 'confirmed',
    price: '$742',
    details: 'Economy · 1 checked bag · Seat 24A',
  },
  {
    type: 'hotel',
    title: 'Hoshinoya Kyoto',
    subtitle: 'Riverside ryokan · 3 nights',
    date: '2026-09-15',
    status: 'confirmed',
    price: '$1,180',
    details: 'Deluxe river room · Breakfast included',
  },
  {
    type: 'event',
    title: 'Gion Night Walking Tour',
    subtitle: 'Guided · 2 hours',
    date: '2026-09-16',
    status: 'pending',
    price: '$48',
    details: '2 tickets · Meets at Yasaka Shrine',
  },
];

const delay = <T,>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const buildBookings = (): Booking[] =>
  BOOKING_SEEDS.map((seed, index) => ({
    ...seed,
    id: `b-${index + 1}`,
    lifecycleStage: seed.status === 'confirmed' ? 'active' : undefined,
  }));

const buildChats = (): Chat[] =>
  Array.from({ length: 6 }, (_, index) => {
    const participant = generateMockUser(index + 3);

    return {
      id: `c-${participant.id}`,
      participant,
      lastMessage:
        index % 2 === 0
          ? 'Sent you the updated itinerary — let me know what you think.'
          : 'Availability confirmed for those dates.',
      timestamp: `${index + 1}h ago`,
      unreadCount: index % 3 === 0 ? index % 4 : 0,
    };
  });

const buildNotifications = (): Notification[] =>
  Array.from({ length: 5 }, (_, index) => {
    const actor = generateMockUser(index + 11);

    return {
      id: `n-${index + 1}`,
      type: (['like', 'comment', 'follow', 'system', 'buddy_request'] as const)[index % 5],
      userName: actor.name,
      userAvatar: actor.avatar,
      message:
        index % 5 === 3
          ? 'Your booking was confirmed by the provider.'
          : `${actor.name} interacted with your recent post.`,
      timestamp: `${index + 1}h ago`,
      isRead: index > 2,
    };
  });

export const fetchAppBootstrap = async (userId: string): Promise<AppBootstrap> => {
  const posts = getMassiveFeed(0, 12);

  return delay({
    posts,
    bookings: buildBookings(),
    chats: buildChats(),
    notifications: buildNotifications(),
    stories: Array.from({ length: 10 }, (_, index) => generateMockUser(index + 1)),
    suggestedUsers: Array.from({ length: 6 }, (_, index) => generateMockUser(index + 21)).filter(
      (user) => user.id !== userId,
    ),
    trendingDestinations: TRENDING_DESTINATIONS,
  });
};

export const fetchFeedPage = async (page: number, pageSize = 10): Promise<Post[]> =>
  delay(getMassiveFeed(page, pageSize));

export const openChatThread = async (currentUserId: string, participantId: string): Promise<Chat> => {
  const numericId = Number(participantId.replace(/\D/g, '')) || 1;
  const participant = generateMockUser(numericId);

  return delay({
    id: `c-${currentUserId}-${participantId}`,
    participant: { ...participant, id: participantId },
    lastMessage: 'Say hello to start the conversation.',
    timestamp: 'Just now',
    unreadCount: 0,
  });
};

export const updateProfileApi = async (
  userId: string,
  payload: UpdateProfilePayload,
): Promise<User> => {
  const session = getPersistedTravelBookSession();
  const base: User = session?.id === userId ? session : { ...generateMockUser(1), id: userId };
  const updated: User = { ...base, ...payload, id: userId };

  updateStoredTravelBookUser(updated);

  return delay(updated);
};

export const searchProvidersApi = async (category: string, location: string): Promise<User[]> => {
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  const candidates = Array.from({ length: 48 }, (_, index) => {
    const user = generateMockUser(index + 1);
    const post = generateMockPost(index + 1);

    return {
      ...user,
      location: post.location,
      provider: user.companyName ?? user.name,
      price: 80 + ((index * 37) % 620),
      rating: Number((3.7 + ((index % 13) / 10)).toFixed(1)),
      verified: index % 4 === 0,
    } satisfies User;
  }).filter((user) => user.isBusiness);

  const matches = candidates.filter((user) => {
    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === 'all' ||
      (user.category ?? '').toLowerCase().includes(normalizedCategory) ||
      (user.providerType ?? '').toLowerCase().includes(normalizedCategory);

    const matchesLocation =
      !normalizedLocation ||
      (user.location ?? '').toLowerCase().includes(normalizedLocation) ||
      (user.name ?? '').toLowerCase().includes(normalizedLocation) ||
      (user.companyName ?? '').toLowerCase().includes(normalizedLocation);

    return matchesCategory && matchesLocation;
  });

  return delay((matches.length > 0 ? matches : candidates).slice(0, 12));
};
