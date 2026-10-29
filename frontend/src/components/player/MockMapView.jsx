import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Navigation, ZoomIn, ZoomOut, Compass, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const MockMapView = ({ grounds }) => {
  const [selectedGround, setSelectedGround] = useState(grounds[0] || null);
  const navigate = useNavigate();

  // Pin coordinates plotted on SVG map
  const pinPositions = [
    { id: 'ground_1', x: '55%', y: '40%' },
    { id: 'ground_2', x: '45%', y: '58%' },
    { id: 'ground_3', x: '58%', y: '68%' },
    { id: 'ground_4', x: '50%', y: '48%' },
    { id: 'ground_5', x: '82%', y: '38%' },
    { id: 'ground_6', x: '68%', y: '62%' }
  ];

  return (
    <div className="relative w-full h-[540px] bg-[#E8F0F8] rounded-3xl overflow-hidden border border-[#E5EDF7] shadow-inner select-none">
      {/* Map Graphic Canvas / SVG with roads, terrain & water bodies */}
      <svg className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1E2F2" strokeWidth="0.8" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="#E8F1FA" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Parks & Green zones */}
        <path d="M 100 80 Q 240 120 320 80 T 480 140 L 440 280 Q 300 320 200 240 Z" fill="#D9F0E1" opacity="0.8" />
        <path d="M 600 300 Q 750 360 880 320 L 920 460 Q 750 500 620 450 Z" fill="#D9F0E1" opacity="0.8" />
        <path d="M 50 380 Q 180 420 260 380 L 220 500 Q 100 520 40 480 Z" fill="#D9F0E1" opacity="0.8" />

        {/* Lake / Water Body */}
        <path d="M 380 200 Q 420 180 480 210 Q 520 250 490 290 Q 430 320 390 280 Z" fill="#BBD8F5" />
        <text x="415" y="250" fill="#2F80ED" fontSize="11" fontWeight="600" opacity="0.7">
          Ulsoor Lake
        </text>

        {/* Primary Arterial Roads & Ring Roads */}
        <path d="M -50 220 C 300 240, 500 180, 1100 220" fill="none" stroke="#FFFFFF" strokeWidth="12" />
        <path d="M -50 220 C 300 240, 500 180, 1100 220" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />

        <path d="M 550 -50 C 530 200, 560 400, 540 600" fill="none" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M 200 -50 C 220 200, 180 400, 200 600" fill="none" stroke="#FFFFFF" strokeWidth="8" />

        {/* Secondary Crossings */}
        <path d="M 100 450 Q 500 520 950 420" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M 300 100 Q 700 260 900 120" fill="none" stroke="#FFFFFF" strokeWidth="6" />

        {/* Area Names */}
        <text x="56%" y="36%" fill="#475569" fontSize="12" fontWeight="700">
          Indiranagar
        </text>
        <text x="40%" y="54%" fill="#475569" fontSize="12" fontWeight="700">
          Koramangala
        </text>
        <text x="58%" y="74%" fill="#475569" fontSize="12" fontWeight="700">
          HSR Layout
        </text>
        <text x="75%" y="34%" fill="#475569" fontSize="12" fontWeight="700">
          Whitefield
        </text>
        <text x="65%" y="60%" fill="#475569" fontSize="12" fontWeight="700">
          Bellandur
        </text>
      </svg>

      {/* Map UI Overlays: Controls */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-[#E5EDF7] flex items-center gap-2 text-xs font-bold text-[#172338]">
        <Compass className="w-4 h-4 text-[#2F80ED]" />
        <span>Bangalore Metro • Turf Radar</span>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-1.5">
        <button
          className="w-8 h-8 rounded-xl bg-white shadow-md border border-[#E5EDF7] flex items-center justify-center text-[#172338] hover:bg-[#F4F8FD]"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 rounded-xl bg-white shadow-md border border-[#E5EDF7] flex items-center justify-center text-[#172338] hover:bg-[#F4F8FD]"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Ground Pins */}
      {grounds.map((ground, idx) => {
        const pinPos = pinPositions[idx] || {
          x: `${30 + (idx * 15) % 60}%`,
          y: `${30 + (idx * 20) % 50}%`
        };
        const isSelected = selectedGround?.id === ground.id;

        return (
          <div
            key={ground.id}
            style={{ left: pinPos.x, top: pinPos.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200"
            onClick={() => setSelectedGround(ground)}
          >
            <div className="relative group">
              <motion.div
                animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border transition-all ${
                  isSelected
                    ? 'bg-[#2F80ED] text-white border-white ring-4 ring-[#2F80ED]/30 scale-110 z-20'
                    : 'bg-white text-[#172338] border-[#E5EDF7] hover:scale-105'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#2F80ED]'}`} />
                <span className="text-[11px] font-bold whitespace-nowrap">
                  ₹{ground.hourlyPrice}/h
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}

      {/* Selected Ground Popup Card */}
      <AnimatePresence>
        {selectedGround && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-5 left-5 right-5 max-w-sm sm:max-w-md bg-white rounded-3xl p-4 shadow-2xl border border-[#E5EDF7] z-30"
          >
            <div className="flex gap-4">
              <ImageWithFallback
                src={selectedGround.heroImage}
                alt={selectedGround.name}
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F80ED] bg-[#D9EAFE]/40 px-2 py-0.5 rounded-md">
                      {selectedGround.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#172338]">
                      <Star className="w-3.5 h-3.5 text-[#F2994A] fill-[#F2994A]" />
                      <span>{selectedGround.rating}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#172338] mt-1 truncate">
                    {selectedGround.name}
                  </h4>
                  <p className="text-xs text-[#687587] truncate">{selectedGround.location}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] mt-2">
                  <div className="text-xs">
                    <span className="font-extrabold text-[#172338]">₹{selectedGround.hourlyPrice}</span>
                    <span className="text-[#687587]"> /hr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=12.9716,77.5946;${selectedGround.coordinates?.coordinates?.[1] || 12.9784},${selectedGround.coordinates?.coordinates?.[0] || 77.6408}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-[#2F80ED] text-xs font-semibold flex items-center gap-1 shadow-xs"
                      title="Open directions in OpenStreetMap"
                    >
                      <Navigation className="w-3 h-3" />
                      <span className="hidden sm:inline">Directions</span>
                    </a>
                    <button
                      onClick={() => navigate(`/player/grounds/${selectedGround.id}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>View Slots</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
