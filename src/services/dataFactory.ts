import { User, Post } from '@/types';
import { ensureProviderPage } from '@/services/providerPageService';

const CATEGORIES = [
  'Digital Nomad', 'Solo Traveler', 'Luxury Traveler', 'Eco Traveler',
  'Backpacker', 'Culture Guide', 'Travel Photographer', 'Food Explorer',
  'Hotel Provider', 'Boutique Hotel', 'Eco Stay', 'Resort',
  'Flight Provider', 'Charter Service', 'Regional Flight', 'Private Jet',
  'Transportation Provider', 'Rail Service', 'Shuttle Service', 'City Transport',
  'Event Provider', 'Tour Provider', 'Entertainment Provider', 'Conference Venue'
];

const LOCATIONS = [
  'Kyoto, Japan', 'Zermatt, Switzerland', 'Bali, Indonesia', 'Paris, France',
  'New York, USA', 'Reykjavik, Iceland', 'Cairo, Egypt', 'Patagonia, Chile',
  'Dubai, UAE', 'Santorini, Greece', 'Marrakesh, Morocco', 'Banff, Canada'
];

const ADJECTIVES = ['Ancient', 'Futuristic', 'Verdant', 'Icy', 'Vibrant', 'Serene', 'Chaotic', 'Majestic'];
const NOUNS = ['Beach', 'Valley', 'Temple', 'District', 'Trail', 'Market', 'Hideaway', 'Promenade'];

const inferProviderType = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('hotel') || normalized.includes('stay') || normalized.includes('resort')) return 'hotel' as const;
  if (normalized.includes('flight') || normalized.includes('jet')) return 'flight' as const;
  if (normalized.includes('transport') || normalized.includes('rail') || normalized.includes('shuttle')) return 'transport' as const;
  if (normalized.includes('event') || normalized.includes('venue')) return 'event' as const;
  if (normalized.includes('tour')) return 'tour' as const;
  if (normalized.includes('entertainment')) return 'entertainment' as const;
  return undefined;
};

export const generateMockUser = (index: number): User => {
  const typeIndex = index % 5;
  const isBusiness = typeIndex !== 0;
  const category = CATEGORIES[index % CATEGORIES.length];
  const membershipTier = isBusiness
    ? index % 8 === 0 ? 'gold' : index % 3 === 0 ? 'premium' : 'standard'
    : index % 11 === 0 ? 'premium' : 'standard';

  const user: User = {
    id: `u-${index}`, name: `User_${index}`,
    username: isBusiness ? `@page_${index}` : `@traveler_${index}`,
    avatar: `https://picsum.photos/seed/u${index}/200`,
    accountType: isBusiness ? 'provider' : 'traveler',
    membershipTier: membershipTier as User['membershipTier'],
    category, isBusiness,
    providerType: isBusiness ? inferProviderType(category) : undefined,
    bio: isBusiness
      ? `Business page #${index}. Sharing offers, updates, and bookable travel experiences.`
      : `Traveler profile #${index}. Sharing useful stay ideas, routes, and trip tips.`,
    companyName: isBusiness ? `User_${index}` : undefined,
    followers: Math.floor(Math.random() * 100000),
    following: Math.floor(Math.random() * 500),
  };

  return { ...user, providerPage: ensureProviderPage(user) };
};

export const generateMockPost = (index: number): Post => {
  const author = generateMockUser(index);
  const location = LOCATIONS[index % LOCATIONS.length];
  const adj = ADJECTIVES[index % ADJECTIVES.length];
  const noun = NOUNS[index % NOUNS.length];
  const businessPost = author.isBusiness;

  return {
    id: `p-${index}`, userId: author.id, author,
    content: businessPost
      ? `${author.name}: New offers, travel tips, and fresh availability for ${location}. Book directly from our page and see what other travelers are saying.`
      : `Travel Note #${index}: Exploring the ${adj} ${noun} in ${location}. Saving this one for a future trip. #TravelBook`,
    imageUrl: `https://picsum.photos/seed/p${index}/1200/800`,
    likes: Math.floor(Math.random() * 50000),
    comments: Math.floor(Math.random() * 1000),
    timestamp: `${Math.floor(index / 100)}h ago`,
    location,
    postType: businessPost && index % 3 === 0 ? 'advertisement' : (index % 10 === 0 ? 'blog' : 'story'),
    isPromoted: businessPost && index % 6 === 0
  };
};

export const getMassiveFeed = (page: number, pageSize: number = 20): Post[] => {
  const posts: Post[] = [];
  const start = page * pageSize;
  for (let i = start; i < start + pageSize; i++) posts.push(generateMockPost(i));
  return posts;
};
