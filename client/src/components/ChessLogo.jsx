import React from 'react';

/**
 * Ultra-Premium Luxury Brand Logo for CHESS
 * Features a 3D sculpted, faceted royal King emblem with 24K gold gradients,
 * specular lighting facets, ambient bloom, and luxury typography.
 */
export function ChessLogo({
  size = 'md', // 'sm' | 'md' | 'lg'
  showSubtitle = true,
  isLight = false,
  className = ''
}) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium Sculpted Emblem Container */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Ambient Golden Glow Backlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-600/40 via-amber-400/30 to-yellow-300/20 blur-md pointer-events-none transform group-hover:scale-115 transition-transform duration-300" />

        {/* Luxury Badge Frame */}
        <div className="relative w-full h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl shadow-amber-500/25 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-900 via-slate-950 to-[#070a12] flex items-center justify-center overflow-hidden relative">
            {/* Subtle internal radial light reflection */}
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-amber-400/20 blur-sm pointer-events-none" />

            {/* Handcrafted 3D Faceted Royal King SVG Emblem */}
            <svg
              viewBox="0 0 64 64"
              className="w-[82%] h-[82%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 24K Polished Gold Gradient (Light Specular Side) */}
                <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="35%" stopColor="#FDE68A" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                {/* Rich Deep Gold Gradient (Core Shadow Side) */}
                <linearGradient id="goldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* Brilliant Specular Platinum White */}
                <linearGradient id="specularGlint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                </linearGradient>

                {/* Base Plinth Gradient */}
                <linearGradient id="basePlinth" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="25%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="75%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
              </defs>

              {/* === 1. ROYAL CROSS FINIAL === */}
              {/* Left facet (Light) */}
              <path
                d="M32 6V14M28 9.5H32"
                stroke="url(#goldLight)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right facet (Shadow) */}
              <path
                d="M32 6V14M32 9.5H36"
                stroke="url(#goldShadow)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Diamond Glint Center of Cross */}
              <circle cx="32" cy="9.5" r="1.5" fill="#FFFFFF" />

              {/* === 2. SCULPTED ROYAL CROWN === */}
              {/* Crown Base Band */}
              <path
                d="M22 20.5C25 19.5 39 19.5 42 20.5L40.5 23H23.5L22 20.5Z"
                fill="url(#basePlinth)"
              />

              {/* Crown Center & Left Crest (Specular Light) */}
              <path
                d="M32 14L28.5 20.5H32V14Z"
                fill="url(#goldLight)"
              />
              <path
                d="M25 16.5L24 20.5H28.5L25 16.5Z"
                fill="url(#goldLight)"
              />
              <path
                d="M20 18.5L22 20.5H24L20 18.5Z"
                fill="url(#goldLight)"
              />

              {/* Crown Center & Right Crest (Shadow Facets) */}
              <path
                d="M32 14V20.5H35.5L32 14Z"
                fill="url(#goldShadow)"
              />
              <path
                d="M39 16.5L35.5 20.5H40L39 16.5Z"
                fill="url(#goldShadow)"
              />
              <path
                d="M44 18.5L40 20.5H42L44 18.5Z"
                fill="url(#goldShadow)"
              />

              {/* Crown Jewels (Faceted Golden Pearls) */}
              <circle cx="20" cy="18" r="1.2" fill="#FFFBEB" />
              <circle cx="25" cy="16" r="1.4" fill="#FFFBEB" />
              <circle cx="32" cy="13.5" r="1.8" fill="#FFFFFF" />
              <circle cx="39" cy="16" r="1.4" fill="#FDE68A" />
              <circle cx="44" cy="18" r="1.2" fill="#F59E0B" />

              {/* === 3. KING HEAD & CHEEKS === */}
              {/* Left cheek (Light) */}
              <path
                d="M32 23H22C20.5 27 22.5 31.5 26 34H32V23Z"
                fill="url(#goldLight)"
              />
              {/* Right cheek (Shadow) */}
              <path
                d="M32 23H42C43.5 27 41.5 31.5 38 34H32V23Z"
                fill="url(#goldShadow)"
              />

              {/* Specular Ridge Down Face Center */}
              <path
                d="M32 23V34"
                stroke="url(#specularGlint)"
                strokeWidth="1"
              />

              {/* === 4. TIERED ARCHITECTURAL COLLAR RINGS === */}
              <path
                d="M24 34.5C26 33.8 38 33.8 40 34.5L39 37H25L24 34.5Z"
                fill="url(#basePlinth)"
              />
              <path
                d="M22 37.5C25 36.8 39 36.8 42 37.5L40.5 40H23.5L22 37.5Z"
                fill="url(#basePlinth)"
              />

              {/* === 5. KING BODY / TAPERED WAIST === */}
              {/* Left Body Facet (Light) */}
              <path
                d="M32 40H24.5C26.5 44 26 48 20 52H32V40Z"
                fill="url(#goldLight)"
              />
              {/* Right Body Facet (Shadow) */}
              <path
                d="M32 40H39.5C37.5 44 38 48 44 52H32V40Z"
                fill="url(#goldShadow)"
              />

              {/* Center Specular Body Highlight */}
              <path
                d="M32 40V52"
                stroke="url(#specularGlint)"
                strokeWidth="1.2"
              />

              {/* === 6. WEIGHTED PEDESTAL BASE === */}
              {/* Upper Stepped Base Ring */}
              <path
                d="M18.5 52C21 51 43 51 45.5 52L47 55.5H17L18.5 52Z"
                fill="url(#basePlinth)"
              />
              {/* Main Lower Foundation Base Rim */}
              <path
                d="M16 56H48L49 59C49 60 47.5 60.5 46 60.5H18C16.5 60.5 15 60 15 59L16 56Z"
                fill="url(#basePlinth)"
              />

              {/* Polished Rim Highlight */}
              <path
                d="M17 59.5C22 60.2 42 60.2 47 59.5"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Luxury Typography: "CHESS" with subtle micro-subtitle */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-[0.08em] uppercase ${textSizes[size]} transition-colors ${
              isLight
                ? 'text-slate-900'
                : 'bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(245,158,11,0.25)]'
            }`}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
          >
            CHESS
          </span>

          {/* Micro Grandmaster Crown Icon / Sparkle */}
          <span className="inline-block text-[10px] text-amber-400 opacity-90 group-hover:rotate-12 transition-transform duration-300">
            ✦
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[8.5px] font-extrabold tracking-[0.22em] uppercase mt-0.5 hidden sm:block ${
              isLight ? 'text-amber-700/80' : 'text-amber-400/80'
            }`}
          >
            Arena • Grandmaster Edition
          </span>
        )}
      </div>
    </div>
  );
}
