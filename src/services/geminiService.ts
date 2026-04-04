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

export const generateItinerary = async (destination: string, interests: string, budget: string, duration: string, departureCity: string = 'anywhere') => {
  if (!API_KEY) return null;
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
