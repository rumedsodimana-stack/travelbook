'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  MapPin, X, ExternalLink, Navigation,
  Loader2, Globe
} from 'lucide-react';

interface MapModalProps {
  location: string;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ location, onClose }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [links, setLinks] = useState<{title: string, uri: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Geolocation denied or unavailable")
      );
    }

    const fetchInsights = async () => {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        // NOTE: Maps Grounding is only supported in Gemini 2.5 series
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Provide a quick expert travel summary and top 3 must-visit spots in ${location}. Focus on logistics and vibe.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: userLoc ? { latitude: userLoc.lat, longitude: userLoc.lng } : undefined
              }
            }
          }
        });

        setInsights(response.text || "No travel tips available right now.");

        // Extract required map URLs from grounding chunks
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const mapsLinks = chunks
          .filter((c: any) => c.maps)
          .map((c: any) => ({
            title: c.maps.title || "View on Google Maps",
            uri: c.maps.uri
          }));
        setLinks(mapsLinks);

      } catch (error) {
        console.error("Map Insights Error:", error);
        setInsights("We couldn't load travel tips for this place right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [location, userLoc]);

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <GlassCard className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden border-white/30 flex flex-col shadow-2xl">
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <MapPin className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl leading-none">{location}</h3>
              <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Map And Travel Tips</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Interactive Map */}
            <div className="h-[300px] lg:h-auto min-h-[400px] relative bg-slate-800 border-r border-white/10">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapEmbedUrl}
                allowFullScreen
              />
              <div className="absolute top-4 left-4">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE MAP
                </div>
              </div>
            </div>

            {/* AI Insights and Grounding Links */}
            <div className="p-6 bg-black/20 flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Globe size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Travel Tips</span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="text-indigo-400 animate-spin" size={32} />
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Place Details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-white/80 text-sm leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/10 italic">
                      {insights}
                    </p>

                    {links.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Helpful Map Links</p>
                        {links.map((link, i) => (
                          <a
                            key={i}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                          >
                            <span className="text-white text-xs font-bold truncate max-w-[200px]">{link.title}</span>
                            <ExternalLink size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                 <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                 >
                  <Navigation size={18} />
                  Open Directions
                 </a>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
