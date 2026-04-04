import { User } from '@/types';
import { generateMockUser } from '@/services/dataFactory';
import { hydrateTravelBookUser } from '@/services/identityService';

export const INTERCONNECT_CONFIG = {
  SABRE: { name: 'Sabre Mosaic / REST GDS', status: 'connected', region: 'US-EAST-1', capabilities: ['NDC Air', 'Hotel Pro', 'Car MOVE'] },
  BIZTRIP_AI: { name: 'BizTrip Agent Orchestrator', status: 'active', version: '2.4.0-agentic', capabilities: ['Policy Check', 'Rebooking', 'Disruption Handling'] },
  PAY_SHIELD: { name: 'Payment Settlement', status: 'online', networks: ['Stripe Connect', 'Bank Transfer'] },
};

export const searchGlobalProviders = async (category: string, criteria: Record<string, unknown>) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const results = [];
  const seed = Math.floor(Math.random() * 1000000);

  for (let i = 0; i < 15; i++) {
    const user = generateMockUser(seed + i);
    const providerNames: Record<string, string[]> = {
      hotel: ['Grand Hotel', 'Boutique Stay', 'City Suites', 'Eco Retreat'],
      flight: ['SkyLink', 'Global Air', 'North Star Air', 'AeroJet'],
      event: ['Festival Night', 'City Pass', 'Sunset Concert', 'Food Fair'],
      transport: ['Rail Link', 'Metro Ride', 'Shuttle Line', 'City Transfer'],
      tour: ['Island Trail Co.', 'Hidden City Walks', 'Mountain Story Tours', 'Local Roots Travel'],
      entertainment: ['Sunset Stage', 'Rooftop Sessions', 'City Lights Live', 'Oceanfront Nights'],
    };
    const possibleNames = providerNames[category] || ['Provider'];
    const namePrefix = possibleNames[i % possibleNames.length];
    const categoryLabelMap: Record<string, string> = { hotel: 'Hotel', flight: 'Airline', event: 'Event', transport: 'Transport Provider', tour: 'Tour Provider', entertainment: 'Entertainment Provider' };
    const providerLabelMap: Record<string, string> = { hotel: 'Stay partner', flight: 'Air partner', event: 'Event partner', transport: 'Transport partner', tour: 'Tour operator', entertainment: 'Entertainment partner' };

    results.push(hydrateTravelBookUser({
      ...user, name: `${namePrefix} #${seed + i}`, accountType: 'provider',
      membershipTier: i % 7 === 0 ? 'gold' : 'premium',
      providerType: category === 'transport' ? 'transport' : (category as User['providerType']),
      category: categoryLabelMap[category] || 'Travel Provider',
      price: Math.floor(Math.random() * 500) + 50, verified: true,
      provider: providerLabelMap[category] || 'Travel partner',
      location: (criteria.location as string) || 'Popular destinations',
    }));
  }
  return results;
};

export const validateInventory = async (_name: string) => {
  return { available: true, price: 100 };
};
