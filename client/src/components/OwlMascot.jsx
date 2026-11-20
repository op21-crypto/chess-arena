import React from 'react';

export function OwlMascot({ size = 72, isSpeaking = false, className = '' }) {
  return (
    <div className={`relative inline-block select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md transition-transform duration-300 ${
          isSpeaking ? 'animate-bounce' : 'hover:scale-105'
        }`}
      >
        {/* Feet */}
        <ellipse cx="40" cy="91" rx="8" ry="4" fill="#F59E0B" />
        <ellipse cx="60" cy="91" rx="8" ry="4" fill="#F59E0B" />

        {/* Body Main Outline & Base */}
        <path
          d="M 50 12 C 26 12 20 30 20 54 C 20 78 30 90 50 90 C 70 90 80 78 80 54 C 80 30 74 12 50 12 Z"
          fill="#3B82F6"
          stroke="#1D4ED8"
          strokeWidth="3.5"
        />

        {/* Ear Tufts */}
        <polygon points="26,16 20,4 34,14" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="74,16 80,4 66,14" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />

        {/* Outer Wings */}
        <path
          d="M 20 45 C 16 56 16 70 24 78 C 22 70 22 55 23 45 Z"
          fill="#1D4ED8"
        />
        <path
          d="M 80 45 C 84 56 84 70 76 78 C 78 70 78 55 77 45 Z"
          fill="#1D4ED8"
        />

        {/* Belly */}
        <ellipse cx="50" cy="64" rx="22" ry="21" fill="#BFDBFE" />

        {/* Belly Feather Details */}
        <path d="M 44 56 Q 50 60 56 56" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 40 64 Q 50 68 60 64" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 44 72 Q 50 76 56 72" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Eyes - Left */}
        <circle cx="37" cy="38" r="14" fill="#FDE047" stroke="#1E40AF" strokeWidth="3" />
        <circle cx="37" cy="38" r="9" fill="#FFFFFF" />
        <circle cx="37" cy="38" r="6" fill="#1E293B" />
        <circle cx="39" cy="36" r="2.2" fill="#FFFFFF" />

        {/* Eyes - Right */}
        <circle cx="63" cy="38" r="14" fill="#FDE047" stroke="#1E40AF" strokeWidth="3" />
        <circle cx="63" cy="38" r="9" fill="#FFFFFF" />
        <circle cx="63" cy="38" r="6" fill="#1E293B" />
        <circle cx="65" cy="36" r="2.2" fill="#FFFFFF" />

        {/* Center Eyebrow Bridge */}
        <path
          d="M 32 26 Q 50 32 68 26"
          stroke="#1E40AF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Beak */}
        <polygon
          points="50,42 44,49 56,49"
          fill="#F97316"
          stroke="#EA580C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
