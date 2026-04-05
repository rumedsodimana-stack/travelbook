'use client';
import { TripPlan, PlanItem, PlanItemOption, PlanItemCategory } from '@/types';

const API_KEY = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : '';

export interface TripPlanInput {
  destination: string;
  originCity: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travellers: number;
  preferences?: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function makeOption(
  title: string, subtitle: string, price: number, currency: string,
  opts: Partial<PlanItemOption> = {}
): PlanItemOption {
  return { id: uid(), title, subtitle, price, currency, ...opts };
}

// ─── Destination-aware data registry ─────────────────────────────────────────
interface DestData {
  country: string; flag: string; timezone: string;
  flights: { airline: string; code: string; duration: number; price: number }[];
  hotels: { name: string; area: string; stars: number; nightlyRate: number; tags: string[] }[];
  activities: { name: string; desc: string; duration: number; price: number; category: PlanItemCategory }[];
  restaurants: { name: string; cuisine: string; price: number; rating: number }[];
  transport: { type: string; desc: string; price: number; duration: number }[];
  visaFee: number; visaNote: string;
}

const DESTINATIONS: Record<string, DestData> = {
  london: {
    country: 'United Kingdom', flag: '🇬🇧', timezone: 'Europe/London',
    flights: [
      { airline: 'British Airways', code: 'BA 117', duration: 450, price: 620 },
      { airline: 'Virgin Atlantic', code: 'VS 401', duration: 475, price: 540 },
      { airline: 'Emirates', code: 'EK 003', duration: 510, price: 490 },
    ],
    hotels: [
      { name: 'The Savoy', area: 'Strand, WC2', stars: 5, nightlyRate: 580, tags: ['5-star', 'Thames views', 'Historic'] },
      { name: 'citizenM Tower of London', area: 'Tower Hill', stars: 4, nightlyRate: 195, tags: ['4-star', 'Modern', 'City views'] },
      { name: 'Travelodge London Central', area: 'City Road', stars: 3, nightlyRate: 95, tags: ['3-star', 'Central', 'Budget-friendly'] },
    ],
    activities: [
      { name: 'Tower of London', desc: 'Crown Jewels & medieval fortress', duration: 180, price: 32, category: 'activity' },
      { name: 'British Museum', desc: 'World history & art', duration: 180, price: 0, category: 'activity' },
      { name: 'Thames River Cruise', desc: 'Hop-on hop-off sightseeing', duration: 120, price: 22, category: 'activity' },
      { name: 'West End Show – Les Misérables', desc: 'Award-winning musical at Sondheim Theatre', duration: 180, price: 75, category: 'entertainment' },
    ],
    restaurants: [
      { name: 'Dishoom Shoreditch', cuisine: 'Bombay Café', price: 28, rating: 4.8 },
      { name: 'The Wolseley', cuisine: 'European Brasserie', price: 45, rating: 4.6 },
      { name: 'Flat Iron', cuisine: 'Steakhouse', price: 22, rating: 4.5 },
    ],
    transport: [
      { type: 'Underground', desc: 'London Tube Day Travelcard (Zones 1–2)', price: 14, duration: 30 },
      { type: 'Black Cab', desc: 'Airport to hotel', price: 65, duration: 55 },
      { type: 'Heathrow Express', desc: 'Paddington – 15 min express', price: 25, duration: 15 },
    ],
    visaFee: 0, visaNote: 'UK ETA required from April 2025 (£10). No visa for most Western passports.',
  },
  paris: {
    country: 'France', flag: '🇫🇷', timezone: 'Europe/Paris',
    flights: [
      { airline: 'Air France', code: 'AF 006', duration: 420, price: 580 },
      { airline: 'easyJet', code: 'U2 2041', duration: 390, price: 320 },
      { airline: 'Lufthansa', code: 'LH 1044', duration: 440, price: 460 },
    ],
    hotels: [
      { name: 'Hôtel Plaza Athénée', area: 'Avenue Montaigne', stars: 5, nightlyRate: 720, tags: ['5-star', 'Eiffel views', 'Iconic'] },
      { name: 'Le Marais Boutique Hotel', area: '4th arrondissement', stars: 4, nightlyRate: 220, tags: ['4-star', 'Historic quarter', 'Trendy'] },
      { name: 'ibis Paris Gare du Nord', area: '10th arrondissement', stars: 3, nightlyRate: 110, tags: ['3-star', 'Transport hub', 'Budget'] },
    ],
    activities: [
      { name: 'Eiffel Tower – Summit', desc: 'Top floor + champagne bar access', duration: 150, price: 32, category: 'activity' },
      { name: 'Louvre Museum', desc: 'Home of the Mona Lisa & Venus de Milo', duration: 240, price: 22, category: 'activity' },
      { name: 'Versailles Day Trip', desc: 'Palace gardens & Hall of Mirrors', duration: 360, price: 55, category: 'activity' },
      { name: 'Moulin Rouge Dinner Show', desc: 'Legendary cabaret experience', duration: 240, price: 185, category: 'entertainment' },
    ],
    restaurants: [
      { name: 'Le Comptoir du Relais', cuisine: 'French Bistro', price: 38, rating: 4.7 },
      { name: 'L\'As du Fallafel', cuisine: 'Middle Eastern', price: 12, rating: 4.6 },
      { name: 'Septime', cuisine: 'Modern French', price: 95, rating: 4.9 },
    ],
    transport: [
      { type: 'Paris Métro', desc: 'Day pass – all zones', price: 8, duration: 25 },
      { type: 'CDG Express', desc: 'Charles de Gaulle to Gare du Nord', price: 15, duration: 20 },
      { type: 'Taxi', desc: 'CDG airport to central Paris', price: 55, duration: 45 },
    ],
    visaFee: 80, visaNote: 'Schengen visa required for non-EU travelers. Apply 3–6 weeks in advance.',
  },
  tokyo: {
    country: 'Japan', flag: '🇯🇵', timezone: 'Asia/Tokyo',
    flights: [
      { airline: 'Japan Airlines', code: 'JL 044', duration: 720, price: 980 },
      { airline: 'ANA', code: 'NH 211', duration: 700, price: 1050 },
      { airline: 'Cathay Pacific', code: 'CX 543', duration: 780, price: 820 },
    ],
    hotels: [
      { name: 'Park Hyatt Tokyo', area: 'Shinjuku', stars: 5, nightlyRate: 620, tags: ['5-star', 'Skyline views', 'Lost in Translation'] },
      { name: 'Dormy Inn Shibuya', area: 'Shibuya', stars: 4, nightlyRate: 175, tags: ['4-star', 'Natural hot spring', 'Vibrant area'] },
      { name: 'Khaosan Tokyo Kabuki', area: 'Asakusa', stars: 3, nightlyRate: 85, tags: ['3-star', 'Traditional area', 'Budget'] },
    ],
    activities: [
      { name: 'Shibuya Sky Observatory', desc: 'Rooftop views over Tokyo', duration: 90, price: 22, category: 'activity' },
      { name: 'Senso-ji Temple, Asakusa', desc: 'Tokyo\'s oldest temple & Nakamise market', duration: 120, price: 0, category: 'activity' },
      { name: 'teamLab Borderless', desc: 'Immersive digital art museum', duration: 180, price: 32, category: 'entertainment' },
      { name: 'Tsukiji Outer Market Food Tour', desc: 'Street food & sushi breakfast', duration: 120, price: 45, category: 'activity' },
    ],
    restaurants: [
      { name: 'Ichiran Ramen Shibuya', cuisine: 'Tonkotsu Ramen', price: 15, rating: 4.7 },
      { name: 'Sushi Saito (Roppongi)', cuisine: 'Omakase Sushi', price: 300, rating: 5.0 },
      { name: 'Gonpachi Nishiazabu', cuisine: 'Izakaya', price: 35, rating: 4.5 },
    ],
    transport: [
      { type: 'Suica IC Card', desc: 'Unlimited metro & JR lines for the day', price: 12, duration: 20 },
      { type: 'Narita Express (N\'EX)', desc: 'Narita Airport to Shinjuku', price: 30, duration: 90 },
      { type: 'Taxi', desc: 'Haneda airport to city center', price: 40, duration: 40 },
    ],
    visaFee: 0, visaNote: 'Visa-free for 90 days (most nationalities). Register on Visit Japan Web before arrival.',
  },
  dubai: {
    country: 'UAE', flag: '🇦🇪', timezone: 'Asia/Dubai',
    flights: [
      { airline: 'Emirates', code: 'EK 202', duration: 420, price: 780 },
      { airline: 'flydubai', code: 'FZ 631', duration: 440, price: 420 },
      { airline: 'Etihad', code: 'EY 101', duration: 450, price: 650 },
    ],
    hotels: [
      { name: 'Burj Al Arab Jumeirah', area: 'Jumeirah Beach', stars: 7, nightlyRate: 1500, tags: ['7-star', 'Iconic sail', 'Butler service'] },
      { name: 'Rove Downtown Dubai', area: 'Downtown', stars: 4, nightlyRate: 180, tags: ['4-star', 'Burj Khalifa views', 'Modern'] },
      { name: 'Premier Inn Dubai Airport', area: 'Deira', stars: 3, nightlyRate: 90, tags: ['3-star', 'Airport access', 'Budget'] },
    ],
    activities: [
      { name: 'Burj Khalifa – At the Top', desc: 'World\'s tallest building observation deck', duration: 120, price: 45, category: 'activity' },
      { name: 'Desert Safari with BBQ Dinner', desc: 'Dune bashing + camel ride + dinner show', duration: 360, price: 85, category: 'activity' },
      { name: 'Dubai Frame', desc: 'Sky bridge between old and new Dubai', duration: 90, price: 20, category: 'activity' },
      { name: 'Dubai Opera – La Traviata', desc: 'World-class performing arts venue', duration: 180, price: 120, category: 'entertainment' },
    ],
    restaurants: [
      { name: 'Nobu Dubai', cuisine: 'Japanese-Peruvian fusion', price: 120, rating: 4.8 },
      { name: 'Al Fanar Restaurant', cuisine: 'Traditional Emirati', price: 45, rating: 4.6 },
      { name: 'Ravi Restaurant', cuisine: 'Pakistani', price: 12, rating: 4.7 },
    ],
    transport: [
      { type: 'Dubai Metro', desc: 'Nol Card – Red Line day pass', price: 8, duration: 25 },
      { type: 'Uber Dubai', desc: 'Airport to Downtown hotel', price: 25, duration: 30 },
      { type: 'RTA Taxi', desc: 'Metered taxi from DXB airport', price: 50, duration: 35 },
    ],
    visaFee: 90, visaNote: 'Visa on arrival for many nationalities (30 days, $90). Pre-apply recommended.',
  },
};

const DEFAULT_DEST: DestData = {
  country: 'International', flag: '🌍', timezone: 'UTC',
  flights: [
    { airline: 'International Airways', code: 'IA 101', duration: 480, price: 650 },
    { airline: 'Global Jet', code: 'GJ 220', duration: 500, price: 520 },
    { airline: 'SkyConnect', code: 'SC 305', duration: 520, price: 480 },
  ],
  hotels: [
    { name: 'Grand Palace Hotel', area: 'City Center', stars: 5, nightlyRate: 350, tags: ['5-star', 'Central', 'Pool & spa'] },
    { name: 'Urban Stay Boutique', area: 'Old Town', stars: 4, nightlyRate: 160, tags: ['4-star', 'Boutique', 'Character'] },
    { name: 'City Comfort Inn', area: 'Downtown', stars: 3, nightlyRate: 80, tags: ['3-star', 'Comfortable', 'Budget-friendly'] },
  ],
  activities: [
    { name: 'City Walking Tour', desc: 'Guided historical walking tour', duration: 180, price: 25, category: 'activity' },
    { name: 'Local Market Visit', desc: 'Vibrant local bazaar & food stalls', duration: 120, price: 0, category: 'activity' },
    { name: 'Cultural Museum', desc: 'National history & art collection', duration: 150, price: 15, category: 'activity' },
    { name: 'Evening Cultural Show', desc: 'Traditional dance & music performance', duration: 150, price: 55, category: 'entertainment' },
  ],
  restaurants: [
    { name: 'The Grand Brasserie', cuisine: 'International', price: 55, rating: 4.6 },
    { name: 'Local Flavors Kitchen', cuisine: 'Traditional', price: 22, rating: 4.5 },
    { name: 'Night Market Grill', cuisine: 'Street Food', price: 12, rating: 4.4 },
  ],
  transport: [
    { type: 'City Metro', desc: 'Day pass – unlimited rides', price: 10, duration: 25 },
    { type: 'Taxi', desc: 'Airport to city center', price: 40, duration: 40 },
    { type: 'Hop-On Hop-Off Bus', desc: 'Tourist circuit – full day', price: 25, duration: 30 },
  ],
  visaFee: 50, visaNote: 'Check visa requirements at your country\'s embassy website before traveling.',
};

// Add Bali to destinations
DESTINATIONS['bali'] = {
  country: 'Indonesia', flag: '🇮🇩', timezone: 'Asia/Makassar',
  flights: [
    { airline: 'Singapore Airlines', code: 'SQ 947', duration: 780, price: 920 },
    { airline: 'Garuda Indonesia', code: 'GA 715', duration: 810, price: 780 },
    { airline: 'AirAsia', code: 'AK 5401', duration: 840, price: 490 },
  ],
  hotels: [
    { name: 'Four Seasons Resort Bali at Jimbaran Bay', area: 'Jimbaran', stars: 5, nightlyRate: 680, tags: ['5-star', 'Private villas', 'Ocean views'] },
    { name: 'Alaya Resort Ubud', area: 'Ubud', stars: 4, nightlyRate: 195, tags: ['4-star', 'Rice terraces', 'Jungle retreat'] },
    { name: 'The Layar – Seminyak Villas', area: 'Seminyak', stars: 4, nightlyRate: 220, tags: ['4-star', 'Private pool', 'Beach access'] },
  ],
  activities: [
    { name: 'Ubud Monkey Forest & Rice Terraces', desc: 'Sacred forest walk & Tegallalang rice paddies', duration: 240, price: 25, category: 'activity' },
    { name: 'Mount Batur Sunrise Hike', desc: 'Pre-dawn trek to active volcano summit', duration: 360, price: 65, category: 'activity' },
    { name: 'Uluwatu Temple Sunset + Kecak Fire Dance', desc: 'Clifftop temple & traditional Balinese dance', duration: 180, price: 35, category: 'entertainment' },
    { name: 'Bali Cooking Class & Market Tour', desc: 'Morning market + hands-on Balinese cooking', duration: 270, price: 45, category: 'activity' },
  ],
  restaurants: [
    { name: 'Locavore Ubud', cuisine: 'Modern Indonesian', price: 95, rating: 4.9 },
    { name: 'Sardine Seminyak', cuisine: 'Seafood & French', price: 55, rating: 4.7 },
    { name: 'Warung Babi Guling Ibu Oka', cuisine: 'Traditional Babi Guling', price: 8, rating: 4.8 },
  ],
  transport: [
    { type: 'Private Driver', desc: 'Full-day island exploration (8 hrs)', price: 55, duration: 0 },
    { type: 'Scooter Rental', desc: 'Self-drive 125cc scooter per day', price: 8, duration: 0 },
    { type: 'Grab Car', desc: 'Airport Ngurah Rai to Seminyak', price: 15, duration: 30 },
  ],
  visaFee: 35, visaNote: 'Visa on Arrival (30 days, $35 USD) or Visa Free for select nationalities.',
};

function resolveDestData(destination: string): DestData {
  const key = destination.toLowerCase().trim();
  for (const [k, v] of Object.entries(DESTINATIONS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_DEST;
}

// ─── Mock plan builder ────────────────────────────────────────────────────────
function buildMockPlan(input: TripPlanInput): TripPlan {
  const dest = resolveDestData(input.destination);
  const days = daysBetween(input.startDate, input.endDate);
  const cur = input.currency;
  const isLuxury = input.budget / days > 500;
  const flightOrder = isLuxury ? dest.flights : [...dest.flights].reverse();
  const hotelOrder = isLuxury ? dest.hotels : [...dest.hotels].reverse();
  const items: PlanItem[] = [];

  // Day 0 time helpers
  let cursor = `${input.startDate}T06:00:00.000Z`;

  const pushItem = (
    category: PlanItemCategory,
    options: PlanItemOption[],
    durationMinutes: number,
    notes: string,
    travelTimeTo = 0,
    isRequired = false,
  ): void => {
    const id = uid();
    const endAt = addMinutes(cursor, durationMinutes);
    items.push({ id, category, scheduledAt: cursor, endAt, durationMinutes, selectedOptionIndex: 0, options, notes, isRequired, travelTimeTo });
    cursor = addMinutes(endAt, travelTimeTo);
  };

  // ── VISA ──────────────────────────────────────────────────────────────────
  pushItem('visa', [
    makeOption('Visa on Arrival', dest.visaNote, dest.visaFee, cur, { tags: ['Required'], duration: 60, rating: 4.2, reviewCount: 1240 }),
    makeOption('e-Visa Online', 'Apply 2 weeks in advance at embassy portal', dest.visaFee * 1.1, cur, { tags: ['Recommended', 'Online'], duration: 60, rating: 4.5, reviewCount: 890 }),
    makeOption('Visa-Free Entry', 'Check eligibility based on your passport', 0, cur, { tags: ['Free', 'Check eligibility'], duration: 30, rating: 4.8, reviewCount: 3200 }),
  ], 60, dest.visaNote, 0, true);

  // ── OUTBOUND FLIGHT ───────────────────────────────────────────────────────
  pushItem('flight', flightOrder.map((f, i) => makeOption(
    `${f.airline} ${f.code}`,
    `${input.originCity} → ${input.destination}, ${Math.floor(f.duration / 60)}h ${f.duration % 60}m`,
    f.price * input.travellers,
    cur,
    { tags: [i === 0 ? (isLuxury ? 'Business class' : 'Economy Flex') : 'Economy', 'Direct'], duration: f.duration, rating: 4.2 + i * 0.1, reviewCount: 800 + i * 150, provider: f.airline }
  )), flightOrder[0].duration, 'Book early for best prices. Check baggage allowance.', 30, true);

  // ── FIRST NIGHT ACCOMMODATION ─────────────────────────────────────────────
  cursor = `${input.startDate}T${String(14 + Math.floor(flightOrder[0].duration / 60) % 8).padStart(2, '0')}:00:00.000Z`;
  pushItem('accommodation', hotelOrder.map((h, i) => makeOption(
    h.name, `${h.stars}★ · ${h.area}`,
    h.nightlyRate * input.travellers,
    cur,
    { tags: h.tags, duration: 480, rating: 3.8 + i * 0.3 + (isLuxury ? 0 : 0.2), reviewCount: 400 + i * 200, provider: h.name }
  )), 20, `Check-in from 3 PM. Luggage storage available if arriving early.`, 15);

  // ── PER-DAY ACTIVITIES ────────────────────────────────────────────────────
  const acts = dest.activities;
  const rests = dest.restaurants;
  for (let d = 0; d < Math.min(days, 7); d++) {
    const dayStart = new Date(input.startDate);
    dayStart.setUTCDate(dayStart.getUTCDate() + d + (d === 0 ? 1 : 0));
    cursor = `${dayStart.toISOString().split('T')[0]}T08:00:00.000Z`;

    // Breakfast
    const bRest = rests[d % rests.length];
    pushItem('dining', [
      makeOption(`Breakfast at ${bRest.name}`, bRest.cuisine, bRest.price * input.travellers, cur, { rating: bRest.rating, reviewCount: 540, duration: 60, tags: ['Breakfast'] }),
      makeOption('Hotel breakfast', 'In-house buffet', 18 * input.travellers, cur, { rating: 4.1, reviewCount: 320, duration: 60, tags: ['Convenient', 'Buffet'] }),
      makeOption('Grab & go', 'Local bakery / coffee shop', 8 * input.travellers, cur, { rating: 4.0, reviewCount: 190, duration: 30, tags: ['Quick', 'Local'] }),
    ], 60, 'Start your day well-rested and fueled.', 20);

    // Morning activity
    const actA = acts[d % acts.length];
    pushItem(actA.category, [
      makeOption(actA.name, actA.desc, actA.price * input.travellers, cur, { rating: 4.6, reviewCount: 1800, duration: actA.duration, tags: ['Top-rated', 'Must-do'] }),
      makeOption(`${actA.name} – Private Tour`, `Private guided experience`, actA.price * 1.8 * input.travellers, cur, { rating: 4.9, reviewCount: 340, duration: actA.duration - 30, tags: ['Private', 'Skip-the-line'] }),
      makeOption('Free exploration', 'Self-guided at your own pace', 0, cur, { rating: 4.3, reviewCount: 220, duration: actA.duration, tags: ['Free', 'Flexible'] }),
    ], actA.duration, `Tip: Book in advance. Best visited ${d % 2 === 0 ? 'in the morning' : 'in the afternoon'} to avoid crowds.`, 20);

    // Lunch
    const lRest = rests[(d + 1) % rests.length];
    pushItem('dining', [
      makeOption(`Lunch at ${lRest.name}`, lRest.cuisine, lRest.price * input.travellers, cur, { rating: lRest.rating, reviewCount: 780, duration: 90, tags: ['Local favorite'] }),
      makeOption('Street food market', 'Authentic local street food stalls', 10 * input.travellers, cur, { rating: 4.5, reviewCount: 1100, duration: 60, tags: ['Authentic', 'Budget'] }),
      makeOption('Café lunch', 'Casual café with Wi-Fi', 20 * input.travellers, cur, { rating: 4.2, reviewCount: 430, duration: 75, tags: ['Relaxed', 'Wi-Fi'] }),
    ], 90, '', 15);

    // Afternoon activity
    const actB = acts[(d + 1) % acts.length];
    pushItem(actB.category, [
      makeOption(actB.name, actB.desc, actB.price * input.travellers, cur, { rating: 4.5, reviewCount: 2100, duration: actB.duration, tags: ['Highly-rated'] }),
      makeOption(`${actB.name} – Group Tour`, 'Join a small group tour', actB.price * 0.8 * input.travellers, cur, { rating: 4.3, reviewCount: 650, duration: actB.duration, tags: ['Group', 'Social'] }),
      makeOption('Alternative: Spa & wellness', 'Traditional local spa treatment', 60 * input.travellers, cur, { rating: 4.7, reviewCount: 890, duration: 120, tags: ['Relaxing', 'Wellness'] }),
    ], actB.duration, '', 30);

    // Dinner
    const dRest = rests[(d + 2) % rests.length];
    pushItem('dining', [
      makeOption(`Dinner at ${dRest.name}`, dRest.cuisine, dRest.price * 1.5 * input.travellers, cur, { rating: dRest.rating, reviewCount: 920, duration: 120, tags: ['Dinner', 'Recommended'] }),
      makeOption('Rooftop dining', 'Sunset dinner with city views', 75 * input.travellers, cur, { rating: 4.6, reviewCount: 560, duration: 120, tags: ['Romantic', 'Views'] }),
      makeOption('Local neighbourhood spot', 'Where the locals eat', 18 * input.travellers, cur, { rating: 4.4, reviewCount: 340, duration: 90, tags: ['Authentic', 'Local'] }),
    ], 120, d % 3 === 0 ? 'Reservations recommended 24–48 hours in advance.' : '', 0);
  }

  // ── RETURN FLIGHT ─────────────────────────────────────────────────────────
  const returnBase = `${input.endDate}T10:00:00.000Z`;
  cursor = returnBase;
  const retFlight = flightOrder[0];
  pushItem('flight', [
    makeOption(`${retFlight.airline} ${retFlight.code.replace(/\d+/, (n) => String(Number(n) + 1))}`,
      `${input.destination} → ${input.originCity}, ${Math.floor(retFlight.duration / 60)}h ${retFlight.duration % 60}m`,
      retFlight.price * input.travellers, cur,
      { tags: ['Return', isLuxury ? 'Business class' : 'Economy Flex'], duration: retFlight.duration, rating: 4.3, reviewCount: 760, provider: retFlight.airline }),
    makeOption(`${flightOrder[1]?.airline ?? dest.flights[1].airline} (Return)`,
      `${input.destination} → ${input.originCity}`, flightOrder[1]?.price * input.travellers ?? retFlight.price * 0.9 * input.travellers, cur,
      { tags: ['Return', 'Economy'], duration: (flightOrder[1]?.duration ?? retFlight.duration) + 30, rating: 4.1, reviewCount: 540 }),
  ], retFlight.duration, 'Arrive at airport 3 hours before departure.', 0, true);

  // ── TOTAL COST ────────────────────────────────────────────────────────────
  const totalEstimatedCost = items.reduce((sum, item) => {
    const opt = item.options[item.selectedOptionIndex];
    return sum + (opt?.price ?? 0);
  }, 0);

  const capitalised = input.destination.charAt(0).toUpperCase() + input.destination.slice(1);
  return {
    id: uid(),
    destination: capitalised,
    originCity: input.originCity,
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    budgetCurrency: input.currency,
    travellers: input.travellers,
    items,
    totalEstimatedCost,
    aiSummary: `Your ${days}-day trip to ${capitalised} is ready! We've curated ${items.length} key experiences across flights, accommodation, activities, and dining — tailored to your ${input.budget} ${input.currency} budget for ${input.travellers} traveller${input.travellers > 1 ? 's' : ''}. Swipe each card to explore alternative options, and tap SELECT to customise your perfect itinerary.`,
    createdAt: new Date().toISOString(),
  };
}

// ─── Gemini integration ───────────────────────────────────────────────────────
async function generateWithGemini(input: TripPlanInput): Promise<TripPlan> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const days = daysBetween(input.startDate, input.endDate);
  const prompt = `You are a world-class travel planner AI. Generate a complete, realistic trip plan as a single JSON object.

Trip details:
- Destination: ${input.destination}
- Origin: ${input.originCity}
- Dates: ${input.startDate} to ${input.endDate} (${days} days)
- Budget: ${input.budget} ${input.currency} total for ${input.travellers} traveller(s)
- Preferences: ${input.preferences || 'None specified'}

Return ONLY valid JSON matching this exact TypeScript type:
{
  "id": "string",
  "destination": "string",
  "originCity": "string",
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "budget": number,
  "budgetCurrency": "string",
  "travellers": number,
  "totalEstimatedCost": number,
  "aiSummary": "2-3 sentence trip overview",
  "createdAt": "ISO datetime",
  "items": [ /* array of PlanItem */ ]
}

Each PlanItem must have:
- id, category (visa|flight|accommodation|transport|activity|dining|event|entertainment)
- scheduledAt (ISO datetime), endAt (ISO datetime), durationMinutes
- selectedOptionIndex: 0
- options: array of 3-4 PlanItemOption objects (each with id, title, subtitle, price, currency, rating, reviewCount, duration, tags, provider)
- notes: AI tip string
- isRequired: boolean
- travelTimeTo: minutes of travel from previous item

Requirements:
- Real airline names, real hotel names, real restaurant names for ${input.destination}
- Include: visa, outbound flight, ${days} nights accommodation, daily breakfast/lunch/dinner, 2+ activities per day, return flight
- Options must differ meaningfully in price, quality, and provider
- Times must be logical and account for travel between locations
- Budget influences option order (cheaper first if budget < ${input.budget / days} per day)
- Return ONLY the JSON, no markdown, no explanation`;

  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
  const text = response.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Gemini response');
  const parsed = JSON.parse(jsonMatch[0]) as TripPlan;
  if (!parsed.items?.length) throw new Error('Empty items array from Gemini');
  return parsed;
}

// ─── Demo preset ──────────────────────────────────────────────────────────────
export const DEMO_PRESET: TripPlanInput = {
  destination: 'Bali',
  originCity: 'London',
  startDate: (() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })(),
  endDate: (() => {
    const d = new Date(); d.setDate(d.getDate() + 37);
    return d.toISOString().split('T')[0];
  })(),
  budget: 3000,
  currency: 'USD',
  travellers: 2,
  preferences: 'Love nature, rice terraces, temples, beach sunsets, and authentic local food.',
};

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateTripPlan(input: TripPlanInput): Promise<TripPlan> {
  if (API_KEY) {
    try {
      return await generateWithGemini(input);
    } catch (e) {
      console.warn('[TripPlanner] Gemini failed, using mock data:', e);
    }
  }
  // Simulate a short async delay for realistic UX
  await new Promise((r) => setTimeout(r, 1800));
  return buildMockPlan(input);
}
