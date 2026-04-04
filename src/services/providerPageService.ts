import {
  IntegrationPreference,
  ProviderConnectionStatus,
  ProviderPage,
  ProviderPageStage,
  ProviderRoomType,
  User,
} from '@/types';

const connectionLabelByPreference: Record<IntegrationPreference, string> = {
  manual: 'Manual portal',
  channel_manager: 'Channel manager',
  direct_api: 'Direct API',
  csv_upload: 'CSV upload',
};

const defaultHotelRooms: ProviderRoomType[] = [
  { id: 'room-deluxe', name: 'Deluxe Room', nightlyRate: 180, inventory: 6, capacity: 2, highlights: ['Breakfast included', 'City view'], status: 'ready' },
  { id: 'room-family', name: 'Family Suite', nightlyRate: 260, inventory: 3, capacity: 4, highlights: ['Balcony', 'Late checkout'], status: 'draft' },
];

export const createDefaultProviderPage = (user: User): ProviderPage | undefined => {
  if (user.accountType !== 'provider') return undefined;
  const connectionLabel = connectionLabelByPreference[user.integrationPreference || 'manual'];
  const baseSummary = user.bio || 'Share updates, build trust, and convert discovery into bookings from one page.';
  const baseHeadline = user.providerType === 'hotel'
    ? 'Turn your hotel page into a direct booking channel.'
    : 'Turn your provider page into a trusted booking storefront.';

  const sharedPage: ProviderPage = {
    headline: baseHeadline, summary: baseSummary, coverImage: user.avatar,
    setupStage: user.onboardingCompleted ? 'content_ready' : 'draft',
    connectionStatus: user.integrationPreference && user.integrationPreference !== 'manual' ? 'pending' : 'manual',
    connectionLabel, directBookingEnabled: false, payoutReady: false,
    responseTime: 'Responds within 2 hours', bookingLeadTime: 'Accepts same-day bookings',
    contentScore: user.onboardingCompleted ? 72 : 42, reviewsEnabled: true, amenities: [],
    highlights: ['Social proof from traveler posts', 'Direct booking CTA'],
    policies: ['Travel Book booking confirmation', 'Support via direct message'],
  };

  if (user.providerType === 'hotel') {
    return { ...sharedPage, headline: 'Show rooms, rates, and availability directly on your hotel page.',
      amenities: ['Free Wi-Fi', 'Breakfast', 'Airport pickup', 'Late check-in'],
      highlights: ['Bookable rooms', 'Traveler reviews', 'Manual or system-connected setup'],
      policies: ['Flexible cancellation', 'ID required at check-in', 'Direct message support'],
      roomTypes: defaultHotelRooms };
  }
  if (user.providerType === 'flight') {
    return { ...sharedPage, amenities: ['Route updates', 'Direct booking CTA', 'Traveler messaging'],
      highlights: ['Live route stories', 'Offer pages', 'Verified booking flow'],
      policies: ['Final fare shown at checkout', 'Support via page messages'] };
  }
  return { ...sharedPage, amenities: ['Traveler messaging', 'Offer highlights', 'Direct booking CTA'] };
};

export const ensureProviderPage = (user: User): ProviderPage | undefined => {
  if (user.accountType !== 'provider') return undefined;
  if (!user.providerPage) return createDefaultProviderPage(user);
  const defaultPage = createDefaultProviderPage(user);
  if (!defaultPage) return user.providerPage;
  return {
    ...defaultPage, ...user.providerPage,
    amenities: user.providerPage.amenities?.length ? user.providerPage.amenities : defaultPage.amenities,
    highlights: user.providerPage.highlights?.length ? user.providerPage.highlights : defaultPage.highlights,
    policies: user.providerPage.policies?.length ? user.providerPage.policies : defaultPage.policies,
    roomTypes: user.providerPage.roomTypes?.length ? user.providerPage.roomTypes : defaultPage.roomTypes,
  };
};

export const getProviderPageStageLabel = (stage: ProviderPageStage) => {
  switch (stage) { case 'content_ready': return 'Content Ready'; case 'bookable': return 'Bookable'; case 'live': return 'Live'; default: return 'Draft'; }
};

export const getConnectionStatusLabel = (status: ProviderConnectionStatus) => {
  switch (status) { case 'connected': return 'Connected'; case 'pending': return 'Pending'; default: return 'Manual'; }
};

export const getHotelLiveRoomCount = (page?: ProviderPage) => (page?.roomTypes || []).filter((room) => room.status === 'live').length;

export const getHotelLowestRate = (page?: ProviderPage) => {
  const roomTypes = page?.roomTypes || [];
  if (roomTypes.length === 0) return null;
  return Math.min(...roomTypes.map((room) => room.nightlyRate));
};

export const updateProviderPage = (user: User, updater: (page: ProviderPage) => ProviderPage): User => {
  const currentPage = ensureProviderPage(user);
  if (!currentPage) return user;
  return { ...user, providerPage: updater(currentPage) };
};

export const adjustProviderRoomInventory = (user: User, roomId: string, delta: number): User => {
  return updateProviderPage(user, (page) => ({
    ...page, roomTypes: (page.roomTypes || []).map((room) =>
      room.id === roomId ? { ...room, inventory: Math.max(0, room.inventory + delta), status: room.inventory + delta > 0 ? room.status : 'draft' } : room),
  }));
};

export const connectProviderSystem = (user: User): User => {
  return updateProviderPage(user, (page) => ({
    ...page, connectionStatus: 'connected',
    setupStage: page.setupStage === 'draft' ? 'content_ready' : page.setupStage,
    contentScore: Math.max(page.contentScore, 78),
  }));
};

export const enableProviderDirectBooking = (user: User): User => {
  return updateProviderPage(user, (page) => ({
    ...page, directBookingEnabled: true, payoutReady: true,
    setupStage: page.setupStage === 'live' ? 'live' : 'bookable',
    roomTypes: (page.roomTypes || []).map((room) => ({ ...room, status: room.inventory > 0 ? 'live' as const : room.status })),
  }));
};

export const polishProviderContent = (user: User): User => {
  return updateProviderPage(user, (page) => ({
    ...page, setupStage: page.directBookingEnabled ? page.setupStage : 'content_ready',
    contentScore: Math.min(100, page.contentScore + 12),
    summary: page.summary || 'Built for travelers to discover, trust, and book straight from the page.',
  }));
};
