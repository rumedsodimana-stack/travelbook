const API_KEY = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : '';

const extractJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Extraction failed. Raw text:", text, e);
    return null;
  }
};

export const getSearchSuggestions = async (input: string) => {
  if (!input || input.length < 2 || !API_KEY) return [];
  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `The user is typing "${input}" in a travel search bar. Provide 5 relevant destination or activity suggestions. Return as a simple JSON array of strings.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } },
    });
    return extractJson(response.text || '[]');
  } catch (error) { console.error("Suggestions Error:", error); return []; }
};

// ---------------------------------------------------------------------------
// Mock itinerary — used when NEXT_PUBLIC_GEMINI_API_KEY is not configured
// ---------------------------------------------------------------------------
function buildMockItinerary(
  destination: string,
  budget: string,
  duration: string,
  departureCity: string,
) {
  const numDays = duration.toLowerCase().includes('week') ? 7
    : duration.includes('5') ? 5
    : duration.includes('10') ? 10
    : 3;
  const mult = budget.toLowerCase().includes('luxury') ? 2
    : budget.toLowerCase().includes('budget') ? 0.6
    : 1;
  const base = Math.round(900 * numDays * mult);
  const days = Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Arrival & First Impressions of ${destination}`
      : i === numDays - 1 ? `Last Day — ${destination} Farewell`
      : `Day ${i + 1} — Exploring ${destination}`,
    items: [
      { time: '08:30', activity: 'Breakfast at local café', description: `Kick off day ${i + 1} with a local breakfast near your hotel in ${destination}.`, category: 'food', estimatedCost: Math.round(18 * mult) },
      { time: '10:00', activity: 'Morning sightseeing', description: `Visit iconic spots and hidden gems of ${destination}.`, category: 'activity', estimatedCost: Math.round(35 * mult) },
      { time: '13:00', activity: 'Lunch', description: 'Savoury local cuisine at a well-rated restaurant.', category: 'food', estimatedCost: Math.round(28 * mult) },
      { time: '15:00', activity: 'Afternoon excursion', description: `Cultural or nature tour around ${destination}.`, category: 'activity', estimatedCost: Math.round(45 * mult) },
      { time: '19:30', activity: 'Dinner', description: 'Evening meal with local flavours.', category: 'food', estimatedCost: Math.round(50 * mult) },
    ],
  }));
  return {
    totalEstimatedBudget: base,
    currency: 'USD',
    flights: { airline: 'Demo Airlines', estimatedPrice: Math.round(420 * mult), duration: '9h 15m', type: 'Return' },
    budgetBreakdown: {
      accommodation: Math.round(base * 0.35),
      food: Math.round(base * 0.25),
      activities: Math.round(base * 0.20),
      transport: Math.round(base * 0.20),
    },
    days,
    sources: [],
  };
}

export const generateItinerary = async (destination: string, interests: string, budget: string, duration: string, departureCity: string = 'anywhere') => {
  if (!API_KEY) {
    // No API key — fall back to demo data so the planner UI stays fully functional
    await new Promise((r) => setTimeout(r, 1800));
    return buildMockItinerary(destination, budget, duration, departureCity);
  }
  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a detailed day-by-day travel itinerary for a ${duration} trip to ${destination} from ${departureCity}. The traveler is interested in ${interests} and has a ${budget} budget. Use Google Search to find REAL current flight options, hotels, and specific activities. Include estimated costs in USD. Provide a total budget summary. Return the data as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalEstimatedBudget: { type: Type.NUMBER }, currency: { type: Type.STRING },
            flights: { type: Type.OBJECT, properties: { airline: { type: Type.STRING }, estimatedPrice: { type: Type.NUMBER }, duration: { type: Type.STRING }, type: { type: Type.STRING } } },
            budgetBreakdown: { type: Type.OBJECT, properties: { accommodation: { type: Type.NUMBER }, food: { type: Type.NUMBER }, activities: { type: Type.NUMBER }, transport: { type: Type.NUMBER } } },
            days: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  day: { type: Type.NUMBER }, title: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, activity: { type: Type.STRING }, description: { type: Type.STRING }, category: { type: Type.STRING }, estimatedCost: { type: Type.NUMBER } }, required: ["time", "activity", "description", "category", "estimatedCost"] } },
                }, required: ["day", "title", "items"],
              },
            },
          }, required: ["totalEstimatedBudget", "days", "budgetBreakdown"],
        },
      },
    });
    const data = extractJson(response.text || 'null');
    const sources = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((chunk: any) => chunk.web)?.map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri })) || [];
    return data ? { ...data, sources } : null;
  } catch (error: unknown) { console.error("Gemini Itinerary Error:", error); throw error; }
};

export const generateItinerarySpeech = async (text: string) => {
  if (!API_KEY) return null;
  try {
    const { GoogleGenAI, Modality } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Summarize this itinerary enthusiastically: ${text}` }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
    return (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { console.error("TTS Error:", error); return null; }
};

export const summarizeReviews = async (reviews: {text: string, rating: number}[]) => {
  if (!API_KEY) return "Community reviews are generally positive.";
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const reviewText = reviews.map(r => `Rating: ${r.rating}/5 - ${r.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze these community reviews and provide a concise summary of general sentiment:\n${reviewText}`,
    });
    return response.text;
  } catch (error) { console.error("Review Summary Error:", error); return "Community reviews are generally positive."; }
};
