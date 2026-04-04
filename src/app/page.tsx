'use client';
import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, Mountain, Settings as SettingsIcon } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { GlassCard } from '@/components/GlassCard';
import { ReservationModal } from '@/components/ReservationModal';
import { ToastProvider, useToast } from '@/components/ToastProvider';
import { AuthView } from '@/views/AuthView';
import { AdminDashboardView } from '@/views/AdminDashboardView';
import { BusinessHubView } from '@/views/BusinessHubView';
import { BookingsView } from '@/views/BookingsView';
import { ChatsView } from '@/views/ChatsView';
import { CreatePostView } from '@/views/CreatePostView';
import { HomeView } from '@/views/HomeView';
import { LiveStreamView } from '@/views/LiveStreamView';
import { NotificationsView } from '@/views/NotificationsView';
import { OnboardingSetupView } from '@/views/OnboardingSetupView';
import { PostDetailView } from '@/views/PostDetailView';
import { ProfileView } from '@/views/ProfileView';
import { SearchView } from '@/views/SearchView';
import { SettingsView } from '@/views/SettingsView';
import { TravelPlannerView } from '@/views/TravelPlannerView';
import { clearTravelBookSession, getPersistedTravelBookSession, updateStoredTravelBookUser } from '@/services/accountService';
import { generateMockUser, getMassiveFeed } from '@/services/dataFactory';
import { hydrateTravelBookUser, resolveIdentityKind } from '@/services/identityService';
import { clearTravelBookInviteContext, getTravelBookInviteContext, TravelBookInviteContext } from '@/services/providerInviteService';
import { syncTravelBookProviderAccount, validateTravelBookProviderInvitation } from '@/services/providerOnboardingApiService';
import { AppRoute, Booking, Chat, Post, User } from '@/types';

const liveAuthor: User = hydrateTravelBookUser({
  ...generateMockUser(901),
  id: 'live-host-1',
  name: 'SkyLink Live',
  username: '@skylink_live',
  avatar: 'https://picsum.photos/seed/skylink-live/200',
  accountType: 'provider',
  providerType: 'flight',
  membershipTier: 'gold',
  category: 'Airline',
  isBusiness: true,
  bio: 'Live route updates from verified flight corridors and active destination windows.',
});

const spotlightHost: User = hydrateTravelBookUser({
  ...generateMockUser(902),
  id: 'host-kyoto-plaza',
  name: 'Grand Plaza Kyoto',
  username: '@grand_plaza_kyoto',
  avatar: 'https://picsum.photos/seed/grand-plaza-kyoto/200',
  accountType: 'provider',
  providerType: 'hotel',
  membershipTier: 'premium',
  category: 'Hotel',
  isBusiness: true,
  bio: 'Verified stay inventory with concierge support and seamless city-center check-in.',
});

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-live-sky',
    userId: liveAuthor.id,
    author: liveAuthor,
    content: 'Live boarding window is open and tonight\'s long-haul route looks perfectly clear. Streaming from the departure gate now.',
    imageUrl: 'https://picsum.photos/seed/live-skylink/1200/1600',
    likes: 18420,
    comments: 612,
    timestamp: 'Live now',
    location: 'Dubai, UAE',
    postType: 'story',
    isLive: true,
    liveViewerCount: 1284,
  },
  {
    id: 'post-grand-plaza',
    userId: spotlightHost.id,
    author: spotlightHost,
    content: 'Our spring city package is open: flexible nights, guided district walks, and creator-ready rooftop views all week.',
    imageUrl: 'https://picsum.photos/seed/grand-plaza-post/1200/900',
    likes: 5210,
    comments: 184,
    timestamp: '1h ago',
    location: 'Kyoto, Japan',
    postType: 'advertisement',
    isPromoted: true,
  },
  ...getMassiveFeed(0, 8),
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-flight-1',
    type: 'flight',
    title: 'SkyLink AX204',
    subtitle: 'New York to Dubai',
    date: '2026-04-12',
    status: 'confirmed',
    price: '$920',
    details: 'Economy Flex • 12h 15m',
    category: 'Airline',
    txHash: '0x5a7f912be1',
    gdsNode: 'Sabre',
    lifecycleStage: 'active',
  },
  {
    id: 'bk-hotel-1',
    type: 'hotel',
    title: 'Grand Plaza Kyoto',
    subtitle: '3 nights • Deluxe Room',
    date: '2026-04-13',
    status: 'confirmed',
    price: '$640',
    details: 'Breakfast • Wi-Fi • Late Check-in',
    category: 'Hotel',
    txHash: '0x8bd412af20',
    gdsNode: 'Travelport',
    lifecycleStage: 'active',
  },
  {
    id: 'bk-event-1',
    type: 'event',
    title: 'Festival Hub Night Pass',
    subtitle: '2 Verified Tickets',
    date: '2026-04-15',
    status: 'confirmed',
    price: '$190',
    details: 'Priority entry • 8 PM',
    category: 'Event',
    txHash: '0xa912c45e77',
    gdsNode: 'Amadeus',
    lifecycleStage: 'active',
  },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-u1',
    participant: {
      ...generateMockUser(45),
      id: 'u1',
      name: 'Maya Rivers',
      username: '@maya_routes',
      avatar: 'https://picsum.photos/seed/maya-rivers/200',
      category: 'Luxury Traveler',
      bio: 'Sharing long-haul city routes, hotel finds, and easy booking tips.',
    },
    lastMessage: 'Did you save that Kyoto stay from the discovery feed?',
    timestamp: '10:22 AM',
    unreadCount: 2,
  },
  {
    id: 'chat-u2',
    participant: {
      ...generateMockUser(46),
      id: 'u2',
      name: 'Blue Horizon Rail',
      username: '@blue_horizon',
      avatar: 'https://picsum.photos/seed/blue-horizon/200',
      category: 'Rail Service',
      isBusiness: true,
      bio: 'Scenic rail inventory and cross-border route support.',
    },
    lastMessage: 'Your rail booking window is ready to confirm.',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'chat-u3',
    participant: {
      ...generateMockUser(47),
      id: 'u3',
      name: 'Aria Nomad',
      username: '@aria_nomad',
      avatar: 'https://picsum.photos/seed/aria-solo/200',
      category: 'Solo Traveler',
      bio: 'Slow travel, budget stays, off-the-beaten-path finds.',
    },
    lastMessage: "Adding it all to my plan 🙌",
    timestamp: 'Mon',
    unreadCount: 1,
  },
  {
    id: 'chat-u4',
    participant: {
      ...generateMockUser(48),
      id: 'u4',
      name: 'Santorini Crest Hotel',
      username: '@santorinicense',
      avatar: 'https://picsum.photos/seed/santorini-h/200',
      category: 'Hotel',
      isBusiness: true,
      bio: 'Clifftop suites and cave rooms with caldera views.',
    },
    lastMessage: 'Our concierge will greet you at arrival.',
    timestamp: 'Tue',
    unreadCount: 0,
  },
  {
    id: 'chat-u5',
    participant: {
      ...generateMockUser(49),
      id: 'u5',
      name: 'Marcus Chen',
      username: '@marcus_adventures',
      avatar: 'https://picsum.photos/seed/marcus/200',
      category: 'Adventure Traveler',
      bio: 'Multi-day treks, gear reviews, and route planning.',
    },
    lastMessage: "This is going to be epic 🏔️🔥",
    timestamp: 'Wed',
    unreadCount: 3,
  },
];

const ROUTE_META: Partial<Record<AppRoute, { title: string; subtitle: string }>> = {
  [AppRoute.HOME]: {
    title: 'Home',
    subtitle: 'Travel ideas, live stories, and featured stays in one feed.',
  },
  [AppRoute.SEARCH]: {
    title: 'Explore',
    subtitle: 'Discover travelers, places, and bookable business pages.',
  },
  [AppRoute.GAMES]: {
    title: 'Businesses',
    subtitle: 'Hotels, flights, transport, tours, events, and entertainment pages.',
  },
  [AppRoute.POST]: {
    title: 'Post',
    subtitle: 'Share a travel update, guide, or buddy request.',
  },
  [AppRoute.BOOKINGS]: {
    title: 'Bookings',
    subtitle: 'Check your upcoming plans, passes, and receipts.',
  },
  [AppRoute.PROFILE]: {
    title: 'Profile',
    subtitle: 'Your travel profile, posts, and account details.',
  },
  [AppRoute.PLANNER]: {
    title: 'Planner',
    subtitle: 'Build a simple trip plan with budget and activity ideas.',
  },
  [AppRoute.POST_DETAIL]: {
    title: 'Post Detail',
    subtitle: 'View comments, reactions, and trip details.',
  },
  [AppRoute.USER_PROFILE]: {
    title: 'Profile',
    subtitle: 'See posts, reviews, and booking options from travelers and businesses.',
  },
  [AppRoute.NOTIFICATIONS]: {
    title: 'Activity',
    subtitle: 'Likes, follows, messages, and booking updates.',
  },
  [AppRoute.CHATS]: {
    title: 'Chats',
    subtitle: 'Private messages for trip ideas and planning.',
  },
  [AppRoute.SETTINGS]: {
    title: 'Settings',
    subtitle: 'Manage your account, privacy, and preferences.',
  },
  [AppRoute.ADMIN]: {
    title: 'Admin',
    subtitle: 'Admin tools, AI connections, and system monitoring.',
  },
};

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [queryInvitation] = useState<TravelBookInviteContext | null>(() => getTravelBookInviteContext());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getPersistedTravelBookSession());
  const [pendingInvitation, setPendingInvitation] = useState<TravelBookInviteContext | null>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(Boolean(queryInvitation));
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [previousRoute, setPreviousRoute] = useState<AppRoute>(AppRoute.HOME);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [livePost, setLivePost] = useState<Post | null>(null);
  const [bookingBusiness, setBookingBusiness] = useState<User | null>(null);
  const [composeContent, setComposeContent] = useState('');
  const [composeType, setComposeType] = useState<Post['postType']>('story');

  const activeRouteMeta = ROUTE_META[currentRoute] || ROUTE_META[AppRoute.HOME]!;

  useEffect(() => {
    let cancelled = false;

    const validateInvite = async () => {
      if (!queryInvitation) {
        setIsInviteLoading(false);
        return;
      }

      if (!queryInvitation.inviteId || !queryInvitation.inviteToken) {
        clearTravelBookInviteContext();
        setIsInviteLoading(false);
        showToast('Invitation link is incomplete. You can still sign up normally.', 'info');
        return;
      }

      try {
        const validation = await validateTravelBookProviderInvitation(queryInvitation);

        if (!cancelled) {
          setPendingInvitation(validation.invitationContext);
        }
      } catch (error) {
        if (!cancelled) {
          clearTravelBookInviteContext();
          setPendingInvitation(null);
          showToast(
            error instanceof Error
              ? `${error.message} You can still create a regular account.`
              : 'Invitation validation failed. You can still create a regular account.',
            'info',
          );
        }
      } finally {
        if (!cancelled) {
          setIsInviteLoading(false);
        }
      }
    };

    void validateInvite();

    return () => {
      cancelled = true;
    };
  }, [queryInvitation, showToast]);

  useEffect(() => {
    if (!currentUser?.onboardingCompleted || !pendingInvitation) {
      return;
    }

    clearTravelBookInviteContext();
    setPendingInvitation(null);
  }, [currentUser, pendingInvitation]);

  const clearPendingInvitation = () => {
    clearTravelBookInviteContext();
    setPendingInvitation(null);
    setIsInviteLoading(false);
  };

  const shouldSyncHotelProvider = (user: User) =>
    user.accountType === 'provider' &&
    user.providerType === 'hotel' &&
    Boolean(user.providerInvitationId && user.providerInvitationToken);

  const syncHotelProvider = async (user: User) => {
    if (!shouldSyncHotelProvider(user)) {
      return user;
    }

    try {
      const syncResult = await syncTravelBookProviderAccount(user);

      return updateStoredTravelBookUser({
        ...user,
        backendProviderId: syncResult.providerId || user.backendProviderId,
      });
    } catch (error) {
      showToast(
        error instanceof Error
          ? `${error.message} Local changes were kept.`
          : 'Provider sync needs attention. Local changes were kept.',
        'info',
      );

      return user;
    }
  };

  const handleLogin = (user: User) => {
    const hydratedUser: User = {
      ...hydrateTravelBookUser(user),
      isAdmin: user.id === 'demo-user-123',
    };

    const storedUser = updateStoredTravelBookUser(hydratedUser);

    setCurrentUser(storedUser);
    setCurrentRoute(
      storedUser.onboardingCompleted
        ? storedUser.accountType === 'traveler'
          ? AppRoute.HOME
          : AppRoute.PROFILE
        : AppRoute.HOME,
    );

    if (storedUser.onboardingCompleted) {
      clearPendingInvitation();
      showToast(`Welcome to Travel Book, ${storedUser.name}.`, 'success');
      return;
    }

    showToast(`Let's finish setting up your ${resolveIdentityKind(storedUser)}.`, 'info');
  };

  const handleCompleteOnboarding = (user: User) => {
    const hydratedUser: User = {
      ...hydrateTravelBookUser(user),
      isAdmin: user.id === 'demo-user-123',
    };

    const storedUser = updateStoredTravelBookUser(hydratedUser);

    clearPendingInvitation();
    setCurrentUser(storedUser);
    setCurrentRoute(storedUser.accountType === 'traveler' ? AppRoute.HOME : AppRoute.PROFILE);
    showToast(`${storedUser.name} is ready to go.`, 'success');

    void syncHotelProvider(storedUser).then((syncedUser) => {
      if (syncedUser.id === storedUser.id) {
        setCurrentUser((current) => (current?.id === syncedUser.id ? syncedUser : current));
      }
    });
  };

  const handleLogout = () => {
    clearTravelBookSession();
    setCurrentUser(null);
    setCurrentRoute(AppRoute.HOME);
    setPreviousRoute(AppRoute.HOME);
    setSelectedPost(null);
    setSelectedUser(null);
    setLivePost(null);
    setBookingBusiness(null);
    setComposeContent('');
    setComposeType('story');
    showToast('Logged out of Travel Book.', 'info');
  };

  const openRoute = (route: AppRoute) => {
    setCurrentRoute(route);
    if (route !== AppRoute.POST) {
      setComposeContent('');
      setComposeType('story');
    }
    if (route !== AppRoute.POST_DETAIL) {
      setSelectedPost(null);
    }
    if (route !== AppRoute.USER_PROFILE) {
      setSelectedUser(null);
    }
  };

  const openProfile = (user: User) => {
    const hydratedUser = hydrateTravelBookUser(user);

    if (currentUser && user.id === currentUser.id) {
      setCurrentRoute(AppRoute.PROFILE);
      return;
    }

    setSelectedUser(hydratedUser);
    setPreviousRoute(currentRoute);
    setCurrentRoute(AppRoute.USER_PROFILE);
  };

  const openBooking = (business: User) => {
    setBookingBusiness(hydrateTravelBookUser(business));
  };

  const openPost = (post: Post) => {
    if (post.isLive) {
      setLivePost(post);
      return;
    }

    setSelectedPost(post);
    setPreviousRoute(currentRoute);
    setCurrentRoute(AppRoute.POST_DETAIL);
  };

  const openPlanner = () => {
    setPreviousRoute(currentRoute);
    setCurrentRoute(AppRoute.PLANNER);
  };

  const openComposer = (content = '', type: Post['postType'] = 'story') => {
    setComposeContent(content);
    setComposeType(type);
    setCurrentRoute(AppRoute.POST);
  };

  const startChatWithUser = (user: User) => {
    const chatId = `chat-${user.id}`;
    setChats((currentChats) => {
      if (currentChats.some((chat) => chat.id === chatId)) {
        return currentChats;
      }

      return [
        {
          id: chatId,
          participant: user,
          lastMessage: 'Say hello and start planning.',
          timestamp: 'Now',
          unreadCount: 0,
        },
        ...currentChats,
      ];
    });

    setCurrentRoute(AppRoute.CHATS);
    showToast(`Chat opened for ${user.name}.`, 'info');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    const storedUser = updateStoredTravelBookUser(updatedUser);

    setCurrentUser((currentCurrentUser) =>
      currentCurrentUser?.id === storedUser.id ? storedUser : currentCurrentUser,
    );
    setSelectedUser((currentSelected) => (currentSelected?.id === storedUser.id ? storedUser : currentSelected));
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.author.id === storedUser.id ? { ...post, author: storedUser } : post)),
    );
    showToast('Profile updated.', 'success');

    void syncHotelProvider(storedUser).then((syncedUser) => {
      if (syncedUser.id !== storedUser.id) {
        return;
      }

      setCurrentUser((currentCurrentUser) =>
        currentCurrentUser?.id === syncedUser.id ? syncedUser : currentCurrentUser,
      );
      setSelectedUser((currentSelected) =>
        currentSelected?.id === syncedUser.id ? syncedUser : currentSelected,
      );
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.author.id === syncedUser.id ? { ...post, author: syncedUser } : post)),
      );
    });
  };

  const handlePlannerShare = (content: string, isBuddyRequest: boolean) => {
    openComposer(content, isBuddyRequest ? 'buddy_request' : 'blog');
    showToast('Your plan was added to the post composer.', 'info');
  };

  const handleBookingConfirm = (booking: Booking) => {
    setBookings((currentBookings) => [booking, ...currentBookings]);
    setBookingBusiness(null);
    setCurrentRoute(AppRoute.BOOKINGS);
    showToast(`${booking.title} added to your bookings.`, 'success');
  };

  if (isInviteLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07161d] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(7, 22, 29, 0.9), rgba(7, 22, 29, 0.96)), url(https://picsum.photos/seed/travel-book-bg/1600/1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <GlassCard className="w-full max-w-lg p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Travel Book Partnerships</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Checking your invitation</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              We&apos;re validating the hotel onboarding link and loading the right setup path for your page.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07161d] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(7, 22, 29, 0.9), rgba(7, 22, 29, 0.96)), url(https://picsum.photos/seed/travel-book-bg/1600/1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <AuthView onLogin={handleLogin} invitationContext={pendingInvitation} />
        </div>
      </div>
    );
  }

  if (!currentUser.onboardingCompleted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07161d] text-white">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(120deg, rgba(7, 22, 29, 0.9), rgba(7, 22, 29, 0.96)), url(https://picsum.photos/seed/travel-book-setup/1600/1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <OnboardingSetupView
            user={currentUser}
            invitationContext={pendingInvitation}
            onComplete={handleCompleteOnboarding}
            onCancel={() => {
              clearTravelBookSession();
              setCurrentUser(null);
              clearPendingInvitation();
              showToast('Registration cancelled.', 'info');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#07161d] text-white">
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute right-[-5rem] top-12 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07161d]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => openRoute(AppRoute.HOME)}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white">
              <Mountain size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none text-white">Travel Book</h1>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/50">
                Plan, book, and share trips
              </p>
            </div>
          </button>

          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-white">{activeRouteMeta.title}</p>
            <p className="text-xs text-white/45">{activeRouteMeta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentRoute(AppRoute.NOTIFICATIONS)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => setCurrentRoute(AppRoute.CHATS)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <MessageCircle size={18} />
            </button>
            <button
              onClick={() => setCurrentRoute(AppRoute.SETTINGS)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-28 px-4 sm:px-6 lg:px-8">
        {currentRoute === AppRoute.HOME && (
          <HomeView posts={posts} setPosts={setPosts} onPostClick={openPost} onProfileClick={openProfile} />
        )}

        {currentRoute === AppRoute.SEARCH && (
          <SearchView onProfileClick={openProfile} onNavigateToPlanner={openPlanner} onBookClick={openBooking} />
        )}

        {currentRoute === AppRoute.GAMES && (
          <BusinessHubView onProfileClick={openProfile} onBookClick={openBooking} />
        )}

        {currentRoute === AppRoute.POST && (
          <CreatePostView
            onComplete={() => {
              setComposeContent('');
              setComposeType('story');
              setCurrentRoute(AppRoute.HOME);
              showToast('Your post is live.', 'success');
            }}
            initialContent={composeContent}
            initialType={composeType}
          />
        )}

        {currentRoute === AppRoute.BOOKINGS && <BookingsView bookings={bookings} />}

        {currentRoute === AppRoute.PROFILE && (
          <ProfileView
            user={currentUser}
            posts={posts}
            onLogout={handleLogout}
            onBusiness={() => setCurrentRoute(AppRoute.SETTINGS)}
            onBookClick={openBooking}
            onPostClick={openPost}
            onSendMessage={startChatWithUser}
            onUpdateProfile={handleProfileUpdate}
            isOwnProfile
          />
        )}

        {currentRoute === AppRoute.PLANNER && (
          <TravelPlannerView
            onBack={() => setCurrentRoute(AppRoute.SEARCH)}
            onBookClick={openBooking}
            onShareAsPost={handlePlannerShare}
          />
        )}

        {currentRoute === AppRoute.POST_DETAIL && selectedPost && (
          <PostDetailView
            post={selectedPost}
            onBack={() => setCurrentRoute(previousRoute)}
            onProfileClick={openProfile}
            onBookClick={openBooking}
          />
        )}

        {currentRoute === AppRoute.USER_PROFILE && selectedUser && (
          <ProfileView
            user={selectedUser}
            posts={posts}
            onLogout={handleLogout}
            onBusiness={() => setCurrentRoute(AppRoute.SETTINGS)}
            onBookClick={openBooking}
            onPostClick={openPost}
            onSendMessage={startChatWithUser}
          />
        )}

        {currentRoute === AppRoute.NOTIFICATIONS && <NotificationsView />}
        {currentRoute === AppRoute.CHATS && <ChatsView chats={chats} setChats={setChats} currentUser={currentUser} />}

        {currentRoute === AppRoute.SETTINGS && (
          <SettingsView
            onLogout={handleLogout}
            onAdminPortal={currentUser.isAdmin ? () => setCurrentRoute(AppRoute.ADMIN) : undefined}
            onProfileEdit={() => setCurrentRoute(AppRoute.PROFILE)}
          />
        )}

        {currentRoute === AppRoute.ADMIN && (
          <AdminDashboardView onBack={() => setCurrentRoute(AppRoute.SETTINGS)} />
        )}
      </main>

      <BottomNav
        currentRoute={currentRoute}
        setRoute={(route) => {
          setSelectedPost(null);
          setSelectedUser(null);
          if (route !== AppRoute.POST) {
            setComposeContent('');
            setComposeType('story');
          }
          setCurrentRoute(route);
        }}
      />

      {bookingBusiness && (
        <ReservationModal
          business={bookingBusiness}
          onClose={() => setBookingBusiness(null)}
          onConfirm={handleBookingConfirm}
        />
      )}

      {livePost && (
        <LiveStreamView post={livePost} onClose={() => setLivePost(null)} onProfileClick={openProfile} />
      )}
    </div>
  );
};

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
