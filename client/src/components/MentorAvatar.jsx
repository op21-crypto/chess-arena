import React from 'react';

/**
 * Ultra-Premium Anime Chess Academy Mentor ("Sensei Hikaru / Grandmaster Elena")
 * Expressive anime-styled chess sensei with animated speech, glowing emerald-gold aura,
 * specular hair highlights, and grandmaster academy blazer.
 */
export function MentorAvatar({ size = 64, isSpeaking = false, className = '' }) {
  return (
    <div
      className={`relative inline-block select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Speaking Ambient Aura Bloom */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-amber-400/30 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Voice Activity Waves Badge when Speaking */}
      {isSpeaking && (
        <div className="absolute -top-1 -right-1 z-20 flex items-center gap-0.5 bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[9px] font-black shadow-md shadow-emerald-500/40 animate-bounce">
          <span className="w-1 h-2 bg-slate-950 rounded-full animate-pulse" />
          <span className="w-1 h-3 bg-slate-950 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-1.5 bg-slate-950 rounded-full animate-pulse delay-150" />
        </div>
      )}

      {/* Character Frame */}
      <div className={`w-full h-full rounded-2xl overflow-hidden p-[1.5px] transition-all duration-300 ${
        isSpeaking
          ? 'bg-gradient-to-br from-emerald-400 via-teal-300 to-amber-400 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-105'
          : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:border-emerald-500/40 hover:scale-105'
      }`}>
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#131d36] via-[#0d1527] to-[#070b14] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Radial Light */}
          <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-emerald-500/20 blur-md pointer-events-none" />

          {/* Handcrafted Anime Sensei Character SVG */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            <defs>
              {/* Hair Gradient */}
              <linearGradient id="animeHair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="60%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Skin Tone Gradient */}
              <linearGradient id="animeSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="100%" stopColor="#FFE4E6" />
              </linearGradient>

              {/* Eye Emerald Gradient */}
              <linearGradient id="animeEye" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Academy Blazer Gradient */}
              <linearGradient id="academyBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Gold Crown Pin */}
              <linearGradient id="goldPin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* Back Hair Shadow */}
            <path
              d="M 28 42 C 22 55 20 72 26 84 C 33 75 35 60 36 50 Z"
              fill="#94A3B8"
            />
            <path
              d="M 72 42 C 78 55 80 72 74 84 C 67 75 65 60 64 50 Z"
              fill="#94A3B8"
            />

            {/* Academy Blazer & Shoulders */}
            <path
              d="M 22 100 C 24 82 36 76 50 76 C 64 76 76 82 78 100 Z"
              fill="url(#academyBlazer)"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* High Academy Collar & Shirt */}
            <polygon points="42,74 58,74 50,88" fill="#F8FAFC" />
            <polygon points="45,74 55,74 50,83" fill="#E2E8F0" />

            {/* Emerald Academy Tie */}
            <polygon points="48,82 52,82 53,96 50,99 47,96" fill="#10B981" />
            <circle cx="50" cy="83" r="2" fill="#047857" />

            {/* Blazer Lapels */}
            <path
              d="M 33 80 L 44 95 L 34 100 Z"
              fill="#0F172A"
              stroke="#10B981"
              strokeWidth="1.2"
            />
            <path
              d="M 67 80 L 56 95 L 66 100 Z"
              fill="#0F172A"
              stroke="#10B981"
              strokeWidth="1.2"
            />

            {/* Gold Grandmaster King Lapel Pin */}
            <g transform="translate(30, 83) scale(0.18)">
              <path d="M 12 4 L 16 4 M 14 2 L 14 6" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
              <path d="M 8 7 L 20 7 L 18 18 L 10 18 Z" fill="url(#goldPin)" />
              <rect x="7" y="19" width="14" height="3" rx="1" fill="#FEF3C7" />
            </g>

            {/* Neck */}
            <rect x="44" y="62" width="12" height="15" rx="3" fill="#FECDD3" />
            <path d="M 44 68 Q 50 72 56 68 Z" fill="#FDA4AF" opacity="0.6" />

            {/* Face Base */}
            <path
              d="M 30 38 C 30 22 70 22 70 38 C 70 54 62 68 50 70 C 38 68 30 54 30 38 Z"
              fill="url(#animeSkin)"
            />

            {/* Cheeks Blush */}
            <ellipse cx="36" cy="52" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.4" />
            <ellipse cx="64" cy="52" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.4" />

            {/* Anime Nose */}
            <circle cx="50" cy="51" r="1" fill="#FDA4AF" />

            {/* Anime Eyes */}
            {/* Left Eye */}
            <g>
              {/* Upper Eyelash */}
              <path d="M 33 42 Q 40 37 45 42" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 34 40 L 32 38" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />

              {/* Iris */}
              <ellipse cx="40" cy="45" rx="5" ry="6.5" fill="url(#animeEye)" />
              {/* Pupil */}
              <ellipse cx="40" cy="45" rx="2.5" ry="3.5" fill="#022C22" />
              {/* Specular Sparkle Highlights */}
              <circle cx="38.5" cy="42.5" r="2" fill="#FFFFFF" />
              <circle cx="42" cy="48" r="1" fill="#FFFFFF" />
            </g>

            {/* Right Eye */}
            <g>
              {/* Upper Eyelash */}
              <path d="M 55 42 Q 60 37 67 42" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 66 40 L 68 38" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />

              {/* Iris */}
              <ellipse cx="60" cy="45" rx="5" ry="6.5" fill="url(#animeEye)" />
              {/* Pupil */}
              <ellipse cx="60" cy="45" rx="2.5" ry="3.5" fill="#022C22" />
              {/* Specular Sparkle Highlights */}
              <circle cx="58.5" cy="42.5" r="2" fill="#FFFFFF" />
              <circle cx="62" cy="48" r="1" fill="#FFFFFF" />
            </g>

            {/* Expressive Eyebrows */}
            <path d="M 34 35 Q 40 32 45 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 55 35 Q 60 32 66 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Animated / Dynamic Mouth */}
            {isSpeaking ? (
              <g className="animate-pulse">
                {/* Speaking Mouth Open */}
                <ellipse cx="50" cy="58" rx="3.5" ry="4" fill="#991B1B" />
                <path d="M 48 56 Q 50 57 52 56" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 48 60 Q 50 59 52 60" fill="#F43F5E" />
              </g>
            ) : (
              /* Gentle Encouraging Smile */
              <path
                d="M 47 57 Q 50 60 53 57"
                stroke="#E11D48"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Stylized Anime Hair (Bangs & Locks) */}
            {/* Top Crown Volume */}
            <path
              d="M 28 32 C 26 14 44 8 50 8 C 56 8 74 14 72 32 Z"
              fill="url(#animeHair)"
            />

            {/* Specular Hair Shine Halo */}
            <path
              d="M 32 24 Q 50 18 68 24 Q 50 20 32 24 Z"
              fill="#FFFFFF"
              opacity="0.75"
            />

            {/* Center & Side Bangs */}
            <path
              d="M 28 28 C 30 36 29 46 27 52 C 32 45 34 38 35 30 Z"
              fill="url(#animeHair)"
            />
            <path
              d="M 33 24 C 38 34 42 44 41 48 C 44 42 46 36 45 25 Z"
              fill="url(#animeHair)"
            />
            <path
              d="M 45 22 C 48 32 52 42 50 47 C 54 40 56 34 54 22 Z"
              fill="url(#animeHair)"
            />
            <path
              d="M 53 24 C 58 34 62 44 61 48 C 64 42 66 36 65 25 Z"
              fill="url(#animeHair)"
            />
            <path
              d="M 72 28 C 70 36 71 46 73 52 C 68 45 66 38 65 30 Z"
              fill="url(#animeHair)"
            />

            {/* Ahoge / Expressive Top Hair Strand */}
            <path
              d="M 50 10 Q 53 2 57 5 Q 52 6 50 10 Z"
              fill="url(#animeHair)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
