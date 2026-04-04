export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  accountType?: AccountType;
  membershipTier?: MembershipTier;
  category?: string;
  isBusiness?: boolean;
  bio?: string;
  rating?: number;
  followers?: number;
  following?: number;
  companyName?: string;
  providerType?: ProviderType;
  supplierType?: SupplierType;
  locationBase?: string;
  website?: string;
  contactEmail?: string;
  integrationPreference?: IntegrationPreference;
  providerPage?: ProviderPage;
  onboardingGoals?: string[];
  onboardingCompleted?: boolean;
  backendProviderId?: string;
  providerInvitationId?: string;
  providerInvitationToken?: string;
  isAdmin?: boolean;
  // Extended fields used by search/booking results
  price?: number;
  verified?: boolean;
  provider?: string;
  location?: string;
}

export type AccountType = 'traveler' | 'provider' | 'supplier';
export type MembershipTier = 'standard' | 'premium' | 'gold';
export type ProviderType = 'hotel' | 'flight' | 'transport' | 'event' | 'tour' | 'entertainment' | 'other';
export type SupplierType = 'inventory_partner' | 'channel_manager' | 'pms' | 'dmc' | 'technology_partner';
export type IntegrationPreference = 'manual' | 'channel_manager' | 'direct_api' | 'csv_upload';
export type ProviderPageStage = 'draft' | 'content_ready' | 'bookable' | 'live';
export type ProviderConnectionStatus = 'manual' | 'pending' | 'connected';
export type ProviderRoomStatus = 'draft' | 'ready' | 'live';

export interface ProviderRoomType {
  id: string;
  name: string;
  nightlyRate: number;
  inventory: number;
  capacity: number;
  highlights: string[];
  status: ProviderRoomStatus;
}

export interface ProviderPage {
  headline: string;
  summary: string;
  coverImage?: string;
  setupStage: ProviderPageStage;
  connectionStatus: ProviderConnectionStatus;
  connectionLabel: string;
  directBookingEnabled: boolean;
  payoutReady: boolean;
  responseTime: string;
  bookingLeadTime: string;
  contentScore: number;
  reviewsEnabled: boolean;
  amenities: string[];
  highlights: string[];
  policies: string[];
  roomTypes?: ProviderRoomType[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  timestamp: string;
}

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  fullContent?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaList?: PostMedia[];
  isLive?: boolean;
  liveViewerCount?: number;
  likes: number;
  comments: number;
  timestamp: string;
  location?: string;
  postType?: 'story' | 'rating' | 'blog' | 'buddy_request' | 'event' | 'advertisement';
  rating?: number;
  isPromoted?: boolean;
}

export interface MessageAsset {
  type: 'crypto' | 'nft';
  value: string;
  symbol?: string;
  imageUrl?: string;
  txHash: string;
  metadata?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  asset?: MessageAsset;
}

export interface Chat {
  id: string;
  participant: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'restaurant' | 'bus' | 'train' | 'car' | 'event';
  title: string;
  subtitle: string;
  date: string;
  status: 'pending' | 'confirmed' | 'on-chain';
  price: string;
  details: string;
  category?: string;
  roomTypeName?: string;
  nights?: number;
  ticketCount?: number;
  txHash?: string;
  blockNumber?: number;
  settleTime?: string;
  gdsNode?: string;
  lifecycleStage?: 'settled' | 'active' | 'completed' | 'canceled';
  checkInCode?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'buddy_request' | 'system';
  userName?: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  isSelf?: boolean;
}

export enum AppRoute {
  HOME = 'home',
  SEARCH = 'search',
  GAMES = 'games',
  POST = 'post',
  BOOKINGS = 'bookings',
  PROFILE = 'profile',
  BUSINESS = 'business',
  POST_DETAIL = 'post_detail',
  USER_PROFILE = 'user_profile',
  PLANNER = 'planner',
  NOTIFICATIONS = 'notifications',
  CHATS = 'chats',
  SETTINGS = 'settings',
  ADMIN = 'admin'
}
