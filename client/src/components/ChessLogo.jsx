import React from 'react';

/**
 * Ultra-Premium Luxury Brand Logo for CHESS
 * Features the ultra-lucid royal clash emblem with 24K gold bezel,
 * specular lighting facets, ambient bloom, and luxury typography.
 */
export function ChessLogo({
  size = 'md', // 'sm' | 'md' | 'lg'
  showSubtitle = true,
  isLight = false,
  useClashIcon = true,
  customTitle = 'CHESS',
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
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/50 via-cyan-500/30 to-amber-300/30 blur-md pointer-events-none transform group-hover:scale-115 transition-transform duration-300" />

        {/* Luxury Badge Frame */}
        <div className="relative w-full h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl shadow-amber-500/25 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300">
          <div className={`w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden relative ${
            isLight
              ? 'bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-900'
              : 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950'
          }`}>
            {useClashIcon ? (
              <img
                src="/icon.svg"
                alt="CHESS Emblem"
                className="w-full h-full object-cover rounded-[13px] transform scale-105"
              />
            ) : (
              <>
                {/* Subtle internal radial light reflection */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-cyan-400/30 blur-sm pointer-events-none" />

                {/* Handcrafted 3D Faceted Royal King SVG Emblem */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-[82%] h-[82%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFBEB" />
                      <stop offset="35%" stopColor="#FDE68A" />
                      <stop offset="70%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>

                    <linearGradient id="goldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>

                    <linearGradient id="specularGlint" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    </linearGradient>

                    <linearGradient id="basePlinth" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="25%" stopColor="#FDE68A" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="75%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                  </defs>

                  {/* ROYAL CROSS FINIAL */}
                  <path
                    d="M32 6V14M28 9.5H32"
                    stroke="url(#goldLight)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M32 6V14M32 9.5H36"
                    stroke="url(#goldShadow)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="9.5" r="1.5" fill="#FFFFFF" />

                  {/* SCULPTED ROYAL CROWN */}
                  <path
                    d="M19 28H45L46.5 24C44 23 41 24.5 39.5 22C38 19.5 35 19 32 17C29 19 26 19.5 24.5 22C23 24.5 20 23 17.5 24L19 28Z"
                    fill="url(#goldShadow)"
                  />
                  <path
                    d="M19 28H32V17C29 19 26 19.5 24.5 22C23 24.5 20 23 17.5 24L19 28Z"
                    fill="url(#goldLight)"
                  />
                  <circle cx="32" cy="22" r="2.2" fill="#FFFFFF" />

                  {/* CHEST & WAISTBAND */}
                  <path
                    d="M21 34H43L44 38H20L21 34Z"
                    fill="url(#goldShadow)"
                  />
                  <path
                    d="M21 34H32V38H20L21 34Z"
                    fill="url(#goldLight)"
                  />

                  {/* BODY FACETS */}
                  <path
                    d="M32 40H24.5C26.5 44 26 48 20 52H32V40Z"
                    fill="url(#goldLight)"
                  />
                  <path
                    d="M32 40H39.5C37.5 44 38 48 44 52H32V40Z"
                    fill="url(#goldShadow)"
                  />
                  <path
                    d="M32 40V52"
                    stroke="url(#specularGlint)"
                    strokeWidth="1.2"
                  />

                  {/* BASE */}
                  <path
                    d="M18.5 52C21 51 43 51 45.5 52L47 55.5H17L18.5 52Z"
                    fill="url(#basePlinth)"
                  />
                  <path
                    d="M16 56H48L49 59C49 60 47.5 60.5 46 60.5H18C16.5 60.5 15 60 15 59L16 56Z"
                    fill="url(#basePlinth)"
                  />
                  <path
                    d="M17 59.5C22 60.2 42 60.2 47 59.5"
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                </svg>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Luxury Typography: "CHESS" with subtle micro-subtitle */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-[0.08em] uppercase ${textSizes[size]} transition-colors ${
              isLight
                ? 'text-slate-900 drop-shadow-sm'
                : 'bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(245,158,11,0.25)]'
            }`}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
          >
            {customTitle || 'CHESS'}
          </span>

          {/* Micro Grandmaster Sparkle */}
          <span className="inline-block text-[11px] text-amber-400 opacity-90 group-hover:rotate-12 transition-transform duration-300">
            ✦
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[8.5px] font-extrabold tracking-[0.22em] uppercase mt-0.5 hidden sm:block ${
              isLight ? 'text-amber-800' : 'text-amber-400/80'
            }`}
          >
            Arena • Grandmaster Edition
          </span>
        )}
      </div>
    </div>
  );
}
