import { User } from '@/types';
import { searchProvidersApi } from '@/services/appApi';

export const INTERCONNECT_CONFIG = {
  SABRE: { name: 'Sabre Mosaic / REST GDS', status: 'connected', region: 'US-EAST-1', capabilities: ['NDC Air', 'Hotel Pro', 'Car MOVE'] },
  BIZTRIP_AI: { name: 'BizTrip Agent Orchestrator', status: 'active', version: '2.4.0-agentic', capabilities: ['Policy Check', 'Rebooking', 'Disruption Handling'] },
  PAY_SHIELD: { name: 'Payment Settlement', status: 'online', networks: ['Stripe Connect', 'Bank Transfer'] },
};

export const searchGlobalProviders = async (category: string, criteria: Record<string, unknown>) =>
  searchProvidersApi(category, String(criteria.location || ''));

export const validateInventory = async (name: string) => {
  const results = await searchProvidersApi('all', name);
  const provider = results[0];

  return {
    available: Boolean(provider),
    price: provider?.price ?? 0,
  };
};
