import { AccountType, IntegrationPreference, MembershipTier, ProviderType, SupplierType } from '@/types';

export const ACCOUNT_TYPE_OPTIONS: Array<{ id: AccountType; title: string; description: string }> = [
  { id: 'traveler', title: 'Traveler', description: 'Share trips, follow people and places, and book from trusted pages.' },
  { id: 'provider', title: 'Provider', description: 'Run a business page for hotels, flights, tours, transport, events, or entertainment.' },
  { id: 'supplier', title: 'Supplier', description: 'Connect inventory, systems, or destination operations into provider pages and bookings.' },
];

export const TRAVELER_STYLE_OPTIONS = [
  'Solo Traveler', 'Digital Nomad', 'Family Traveler', 'Luxury Traveler',
  'Adventure Traveler', 'Food Explorer', 'Travel Creator',
];

export const PROVIDER_TYPE_OPTIONS: Array<{ id: ProviderType; label: string }> = [
  { id: 'hotel', label: 'Hotel / Stay' },
  { id: 'flight', label: 'Flight / Airline' },
  { id: 'transport', label: 'Transport / Transfers' },
  { id: 'event', label: 'Event / Venue' },
  { id: 'tour', label: 'Tour / Experience' },
  { id: 'entertainment', label: 'Entertainment / Attraction' },
  { id: 'other', label: 'Other Travel Provider' },
];

export const SUPPLIER_TYPE_OPTIONS: Array<{ id: SupplierType; label: string }> = [
  { id: 'inventory_partner', label: 'Inventory Supplier' },
  { id: 'channel_manager', label: 'Channel Manager' },
  { id: 'pms', label: 'PMS / Hotel System' },
  { id: 'dmc', label: 'DMC / Local Operator' },
  { id: 'technology_partner', label: 'Technology Partner' },
];

export const INTEGRATION_OPTIONS: Array<{ id: IntegrationPreference; label: string }> = [
  { id: 'manual', label: 'Manual Setup' },
  { id: 'channel_manager', label: 'Channel Manager' },
  { id: 'direct_api', label: 'Direct API' },
  { id: 'csv_upload', label: 'CSV Upload' },
];

export const ACCOUNT_GOALS: Record<AccountType, string[]> = {
  traveler: ['Share trips', 'Save places', 'Follow providers', 'Book from pages'],
  provider: ['Launch business page', 'Take direct bookings', 'Collect reviews', 'Connect existing system'],
  supplier: ['Sync inventory', 'Support provider onboarding', 'Connect PMS or channel manager', 'Manage supply network'],
};

export const PROVIDER_CATEGORY_BY_TYPE: Record<ProviderType, string> = {
  hotel: 'Hotel Provider', flight: 'Flight Provider', transport: 'Transportation Provider',
  event: 'Event Provider', tour: 'Tour Provider', entertainment: 'Entertainment Provider', other: 'Travel Provider',
};

export const SUPPLIER_CATEGORY_BY_TYPE: Record<SupplierType, string> = {
  inventory_partner: 'Inventory Supplier', channel_manager: 'Channel Manager Supplier',
  pms: 'PMS Supplier', dmc: 'Destination Supplier', technology_partner: 'Technology Partner',
};

export const ACCOUNT_LABEL_BY_TYPE: Record<AccountType, string> = {
  traveler: 'Traveler', provider: 'Provider', supplier: 'Supplier',
};

export const MEMBERSHIP_TIER_OPTIONS: Array<{ id: MembershipTier; title: string; description: string }> = [
  { id: 'standard', title: 'Standard', description: 'A simple start for profiles and pages with no verification badge.' },
  { id: 'premium', title: 'Premium', description: 'Adds a blue badge and stronger trust for travelers, providers, and suppliers.' },
  { id: 'gold', title: 'Gold', description: 'Adds a gold badge and top-tier presence for premium profiles and pages.' },
];
