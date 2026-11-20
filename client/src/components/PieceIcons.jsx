import React from 'react';

export const PIECE_THEMES = {
  neo: 'Classic Neo',
  wood: 'Wood Carved',
  cyber: 'Cyber Neon'
};

export const BOARD_THEMES = {
  emerald: {
    name: 'Tournament Emerald',
    light: '#ebecd0',
    dark: '#779556',
    border: '#4a6331',
    highlight: 'rgba(255, 255, 0, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  wood: {
    name: 'Classic Walnut',
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#8a5a36',
    highlight: 'rgba(245, 158, 11, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  ocean: {
    name: 'Ocean Cobalt',
    light: '#d2e7ee',
    dark: '#4d7c8a',
    border: '#2c4d57',
    highlight: 'rgba(56, 189, 248, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  midnight: {
    name: 'Midnight Cyber',
    light: '#94a3b8',
    dark: '#1e293b',
    border: '#0f172a',
    highlight: 'rgba(168, 85, 247, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  amethyst: {
    name: 'Royal Purple',
    light: '#f3e8ff',
    dark: '#7e22ce',
    border: '#581c87',
    highlight: 'rgba(234, 179, 8, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  }
};

export function PieceIcon({ piece, color, size = 42, theme = 'neo' }) {
  if (!piece) return null;
  const isWhite = color === 'w';

  const fill = isWhite ? '#ffffff' : '#1e293b';
  const stroke = isWhite ? '#1e293b' : '#000000';
  const innerShade = isWhite ? '#f1f5f9' : '#0f172a';

  switch (piece.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {isWhite && (
            <path
              d="M22.5 10c-1.66 0-3 1.34-3 3 0 .7.24 1.34.64 1.85.7.88 1.46 1.15 2.36 1.15s1.66-.27 2.36-1.15c.4-.51.64-1.15.64-1.85 0-1.66-1.34-3-3-3z"
              fill={innerShade}
            />
          )}
        </svg>
      );

    case 'r': // Rook
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.95 1.23-1.5 1.5-1 0-2.06 1.15-2.5-.5-.45-1.69 1-3.69 2.5-4.5 2-1 3.5-3.5 3.5-6.5 0-2.8 1.5-5.5 3.5-7 2.5-2 5.5-2 7.5-1.5z" />
            <circle cx="15.5" cy="19.5" r="1.5" fill={isWhite ? '#000000' : '#ffffff'} />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            <path d="M17.5 26h10M22.5 21v10" fill="none" stroke={stroke} strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-14-4.5 14-4.5-14-4 14-7-11 2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11 38.5c6.5 1 16.5 1 23 0" fill="none" />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" stroke={stroke} strokeWidth="1.5" fill="none" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2-6 2s-3-2-5-2-4 2-5 3-3-3-5-3-5 2-5 2-2-3-6-2c-3 6 6 10.5 6 10.5v7z" />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}
