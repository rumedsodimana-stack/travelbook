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
import { AIPlannerView } from '@/views/AIPlannerView';
import {
  clearTravelBookSession,
  getPersistedTravelBookSession,
  updateStoredTravelBookUser,
} from '@/services/accountService';
import {
  fetchAppBootstrap,
  fetchFeedPage,
  openChatThread,
  updateProfileApi,
} from '@/services/appApi';
import { hydrateTravelBookUser, resolveIdentityKind } from '@/services/identityService';
import {
  clearTravelBookInviteContext,
  getTravelBookInviteContext,
  TravelBookInviteContext,
} from '@/services/providerInviteService';
import {
  syncTravelBookProviderAccount,
  validateTravelBookProviderInvitation,
} from '@/services/providerOnboardingApiService';
import { AppRoute, Booking, Chat, Post, User } from '@/types';

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
  [AppRoute.AI_PLANNER]: {
    title: 'AI Trip Planner',
    subtitle: 'Build a full itinerary with AI — flights, hotels, activities, and timing.',
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stories, setStories] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingDestinations, setTrendingDestinations] = useState<string[]>([]);
  const [isAppDataLoading, setIsAppDataLoading] = useState(false);
  const [appDataError, setAppDataError] = useState<string | null>(null);
  const [feedPage, setFeedPage] = useState(1);
  const [isFeedLoadingMore, setIsFeedLoadingMore] = useState(false);
  const [appDataVersion, setAppDataVersion] = useState(0);
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

  useEffect(() => {
    let cancelled = false;

    const loadAppData = async () => {
      if (!currentUser?.onboardingCompleted) {
        return;
      }

      setIsAppDataLoading(true);
      setAppDataError(null);

      try {
        const data = await fetchAppBootstrap(currentUser.id);

        if (cancelled) {
          return;
        }

        setPosts(data.posts);
        setBookings(data.bookings);
        setChats(data.chats);
        setStories(data.stories);
        setSuggestedUsers(data.suggestedUsers);
        setTrendingDestinations(data.trendingDestinations);
        setFeedPage(1);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAppDataError(
          error instanceof Error
            ? error.message
            : 'TravelBook could not load live app data.',
        );
        setPosts([]);
        setBookings([]);
        setChats([]);
        setStories([]);
        setSuggestedUsers([]);
        setTrendingDestinations([]);
      } finally {
        if (!cancelled) {
          setIsAppDataLoading(false);
        }
      }
    };

    void loadAppData();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.onboardingCompleted, appDataVersion]);

  const clearPendingInvitation = () => {
    clearTravelBookInviteContext();
    setPendingInvitation(null);
    setIsInviteLoading(false);
  };

  const reloadAppData = () => setAppDataVersion((currentVersion) => currentVersion + 1);

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

    const completeOnboarding = async () => {
      let nextUser = hydratedUser;

      try {
        const remoteUser = await updateProfileApi(hydratedUser.id, {
          name: hydratedUser.name,
          username: hydratedUser.username,
          avatar: hydratedUser.avatar,
          accountType: hydratedUser.accountType,
          bio: hydratedUser.bio,
          category: hydratedUser.category,
          companyName: hydratedUser.companyName,
          providerType: hydratedUser.providerType,
          supplierType: hydratedUser.supplierType,
          locationBase: hydratedUser.locationBase,
          website: hydratedUser.website,
          contactEmail: hydratedUser.contactEmail,
          integrationPreference: hydratedUser.integrationPreference,
          membershipTier: hydratedUser.membershipTier,
          onboardingGoals: hydratedUser.onboardingGoals,
          onboardingCompleted: hydratedUser.onboardingCompleted,
          providerInvitationId: hydratedUser.providerInvitationId,
          providerInvitationToken: hydratedUser.providerInvitationToken,
          backendProviderId: hydratedUser.backendProviderId,
        });

        nextUser = {
          ...hydratedUser,
          ...remoteUser,
          isAdmin: hydratedUser.isAdmin,
        };
      } catch (error) {
        showToast(
          error instanceof Error
            ? `${error.message} Local changes were kept.`
            : 'TravelBook could not save that setup yet. Local changes were kept.',
          'info',
        );
      }

      const storedUser = updateStoredTravelBookUser(nextUser);

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

    void completeOnboarding();
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
    setPosts([]);
    setBookings([]);
    setChats([]);
    setStories([]);
    setSuggestedUsers([]);
    setTrendingDestinations([]);
    setAppDataError(null);
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

  const openAIPlanner = () => {
    setPreviousRoute(currentRoute);
    setCurrentRoute(AppRoute.AI_PLANNER);
  };

  const openComposer = (content = '', type: Post['postType'] = 'story') => {
    setComposeContent(content);
    setComposeType(type);
    setCurrentRoute(AppRoute.POST);
  };

  const startChatWithUser = async (user: User) => {
    if (!currentUser) {
      return;
    }

    try {
      const chat = await openChatThread(currentUser.id, user.id);
      setChats((currentChats) => [
        chat,
        ...currentChats.filter((existingChat) => existingChat.id !== chat.id),
      ]);
      setCurrentRoute(AppRoute.CHATS);
      showToast(`Chat opened for ${user.name}.`, 'info');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'TravelBook could not open that chat yet.',
        'info',
      );
    }
  };

  const handleProfileUpdate = async (updatedUser: User) => {
    try {
      const remoteUser = await updateProfileApi(updatedUser.id, {
        name: updatedUser.name,
        bio: updatedUser.bio,
        category: updatedUser.category,
        membershipTier: updatedUser.membershipTier,
      });
      const storedUser = updateStoredTravelBookUser(remoteUser);

      setCurrentUser((currentCurrentUser) =>
        currentCurrentUser?.id === storedUser.id ? storedUser : currentCurrentUser,
      );
      setSelectedUser((currentSelected) =>
        currentSelected?.id === storedUser.id ? storedUser : currentSelected,
      );
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.author.id === storedUser.id ? { ...post, author: storedUser } : post)),
      );
      setStories((currentStories) =>
        currentStories.map((storyUser) => (storyUser.id === storedUser.id ? storedUser : storyUser)),
      );
      setSuggestedUsers((currentSuggestions) =>
        currentSuggestions.map((suggestedUser) => (suggestedUser.id === storedUser.id ? storedUser : suggestedUser)),
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
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Profile update failed.',
        'info',
      );
    }
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

  const handleLoadMorePosts = async () => {
    setIsFeedLoadingMore(true);

    try {
      const nextPosts = await fetchFeedPage(feedPage, 10);
      setPosts((currentPosts) => [
        ...currentPosts,
        ...nextPosts.filter((post) => !currentPosts.some((existingPost) => existingPost.id === post.id)),
      ]);
      setFeedPage((currentPage) => currentPage + 1);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'TravelBook could not load more posts.',
        'info',
      );
    } finally {
      setIsFeedLoadingMore(false);
    }
  };

  const renderRoute = () => {
    if (isAppDataLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center py-10">
          <GlassCard className="w-full max-w-xl p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Travel Book Data</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Loading your live app data</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Feed, bookings, chats, notifications, and suggested profiles are being loaded from the API.
            </p>
          </GlassCard>
        </div>
      );
    }

    if (appDataError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center py-10">
          <GlassCard className="w-full max-w-xl p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Travel Book Data</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Live data needs attention</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{appDataError}</p>
            <button
              onClick={reloadAppData}
              className="mt-6 rounded-2xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950"
            >
              Retry loading
            </button>
          </GlassCard>
        </div>
      );
    }

    if (currentRoute === AppRoute.HOME) {
      return (
        <HomeView
          posts={posts}
          stories={stories}
          suggestedUsers={suggestedUsers}
          trendingDestinations={trendingDestinations}
          isLoadingMore={isFeedLoadingMore}
          onLoadMore={handleLoadMorePosts}
          onPostClick={openPost}
          onProfileClick={openProfile}
        />
      );
    }

    if (currentRoute === AppRoute.SEARCH) {
      return <SearchView onProfileClick={openProfile} onNavigateToPlanner={openPlanner} onBookClick={openBooking} />;
    }

    if (currentRoute === AppRoute.GAMES) {
      return <BusinessHubView onProfileClick={openProfile} onBookClick={openBooking} />;
    }

    if (currentRoute === AppRoute.POST) {
      return (
        <CreatePostView
          currentUser={currentUser!}
          onComplete={() => {
            setComposeContent('');
            setComposeType('story');
            setCurrentRoute(AppRoute.HOME);
            showToast('Your post is live.', 'success');
            reloadAppData();
          }}
          initialContent={composeContent}
          initialType={composeType}
        />
      );
    }

    if (currentRoute === AppRoute.BOOKINGS) {
      return <BookingsView bookings={bookings} />;
    }

    if (currentRoute === AppRoute.PROFILE) {
      return (
        <ProfileView
          user={currentUser!}
          posts={posts}
          onLogout={handleLogout}
          onBusiness={() => setCurrentRoute(AppRoute.SETTINGS)}
          onBookClick={openBooking}
          onPostClick={openPost}
          onSendMessage={startChatWithUser}
          onUpdateProfile={handleProfileUpdate}
          isOwnProfile
        />
      );
    }

    if (currentRoute === AppRoute.PLANNER) {
      return (
        <TravelPlannerView
          onBack={() => setCurrentRoute(AppRoute.SEARCH)}
          onBookClick={openBooking}
          onShareAsPost={handlePlannerShare}
          onTripSaved={() => openRoute(AppRoute.BOOKINGS)}
          onNavigateToBookings={() => openRoute(AppRoute.BOOKINGS)}
        />
      );
    }

    if (currentRoute === AppRoute.AI_PLANNER) {
      return <AIPlannerView onBack={() => setCurrentRoute(previousRoute)} />;
    }

    if (currentRoute === AppRoute.POST_DETAIL && selectedPost) {
      return (
        <PostDetailView
          post={selectedPost}
          currentUser={currentUser!}
          onBack={() => setCurrentRoute(previousRoute)}
          onProfileClick={openProfile}
          onBookClick={openBooking}
        />
      );
    }

    if (currentRoute === AppRoute.USER_PROFILE && selectedUser) {
      return (
        <ProfileView
          user={selectedUser}
          posts={posts}
          onLogout={handleLogout}
          onBusiness={() => setCurrentRoute(AppRoute.SETTINGS)}
          onBookClick={openBooking}
          onPostClick={openPost}
          onSendMessage={startChatWithUser}
        />
      );
    }

    if (currentRoute === AppRoute.NOTIFICATIONS) {
      return <NotificationsView currentUser={currentUser!} />;
    }

    if (currentRoute === AppRoute.CHATS) {
      return <ChatsView chats={chats} setChats={setChats} currentUser={currentUser!} />;
    }

    if (currentRoute === AppRoute.SETTINGS) {
      return (
        <SettingsView
          onLogout={handleLogout}
          onAdminPortal={currentUser?.isAdmin ? () => setCurrentRoute(AppRoute.ADMIN) : undefined}
          onProfileEdit={() => setCurrentRoute(AppRoute.PROFILE)}
        />
      );
    }

    if (currentRoute === AppRoute.ADMIN) {
      return <AdminDashboardView onBack={() => setCurrentRoute(AppRoute.SETTINGS)} />;
    }

    return null;
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
        {renderRoute()}
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
        <LiveStreamView
          post={livePost}
          currentUser={currentUser!}
          onClose={() => setLivePost(null)}
          onProfileClick={openProfile}
        />
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
