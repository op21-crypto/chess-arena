import React from 'react';

export const PIECE_COLOR_PALETTES = {
  classic: {
    name: 'Ivory & Ebony',
    white: '#ffffff',
    whiteStroke: '#0f172a',
    black: '#1e293b',
    blackStroke: '#000000',
    accent: '#cbd5e1'
  },
  gold: {
    name: 'Gilded Gold & Obsidian',
    white: '#fef08a',
    whiteStroke: '#854d0e',
    black: '#18181b',
    blackStroke: '#000000',
    accent: '#eab308'
  },
  silver: {
    name: 'Platinum & Charcoal',
    white: '#f8fafc',
    whiteStroke: '#475569',
    black: '#334155',
    blackStroke: '#0f172a',
    accent: '#94a3b8'
  },
  rose: {
    name: 'Rose Gold & Slate',
    white: '#ffe4e6',
    whiteStroke: '#be123c',
    black: '#27272a',
    blackStroke: '#09090b',
    accent: '#f43f5e'
  },
  emerald: {
    name: 'Royale Emerald & Onyx',
    white: '#ecfdf5',
    whiteStroke: '#065f46',
    black: '#1c1917',
    blackStroke: '#042f2e',
    accent: '#10b981'
  }
};

export const PIECE_THEMES = {
  alexander: {
    name: 'Alexander',
    desc: 'Classic Staunton master standard with balanced geometric proportions',
    accent: '#ffffff'
  },
  constantine: {
    name: 'Constantine',
    desc: 'Imperial royal detailing with intricate crowns and bastions',
    accent: '#cbd5e1'
  },
  napoleon: {
    name: 'Napoleon',
    desc: 'Polished silver metallic finish with dimensional contours',
    accent: '#94a3b8'
  },
  william: {
    name: 'William',
    desc: 'Bold medieval outlines and heavy fortress stonework',
    accent: '#f8fafc'
  },
  cleopatra: {
    name: 'Cleopatra',
    desc: 'Flowing Egyptian curves and rounded ornamental crowns',
    accent: '#fed7aa'
  },
  leonidas: {
    name: 'Leonidas',
    desc: 'Spartan geometric cuts and sharp battle-ready silhouettes',
    accent: '#f1f5f9'
  },
  hannibal: {
    name: 'Hannibal',
    desc: 'Carthaginian master tactician with curved battle crests',
    accent: '#fef3c7'
  },
  caligula: {
    name: 'Caligula',
    desc: 'Roman imperial majesty with dramatic heavy diadems',
    accent: '#e2e8f0'
  },
  montezuma: {
    name: 'Montezuma',
    desc: 'Aztec sun empire motifs and bold feathered geometry',
    accent: '#fed7aa'
  },
  victoria: {
    name: 'Victoria',
    desc: 'Victorian era court elegance with refined royal crowns',
    accent: '#f1f5f9'
  },
  tutankhamen: {
    name: 'Tutankhamen',
    desc: 'Golden pharaoh regalia with sculpted nemes headdress',
    accent: '#fef08a'
  },
  xerxes: {
    name: 'Xerxes',
    desc: 'Persian royal majesty with towering ornate battlements',
    accent: '#e0e7ff'
  },
  joanna: {
    name: "Joanna d'Arc",
    desc: 'Gilded golden champion armor with heroic royal heraldry',
    accent: '#facc15'
  },
  pericles: {
    name: 'Pericles',
    desc: 'Athenian classical golden age with sculpted column capitals',
    accent: '#e2e8f0'
  },
  hammurabi: {
    name: 'Hammurabi',
    desc: 'Babylonian stone carved pillars of justice and strength',
    accent: '#cbd5e1'
  },
  commodus: {
    name: 'Commodus',
    desc: 'Colosseum gladiatorial power and iron Roman pillars',
    accent: '#94a3b8'
  }
};

export const BOARD_THEMES = {
  amoled: {
    name: "AMOLED Pure Black",
    light: "#1e293b",
    dark: "#000000",
    border: "#f59e0b",
    highlight: "rgba(245, 158, 11, 0.55)",
    check: "rgba(239, 68, 68, 0.85)"
  },
  cappuccino: {
    name: 'Cappuccino',
    light: '#e6d3b3',
    dark: '#a87a51',
    border: '#7c5432',
    highlight: 'rgba(234, 179, 8, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  greenwich: {
    name: 'Greenwich',
    light: '#ebecd0',
    dark: '#759858',
    border: '#45612c',
    highlight: 'rgba(250, 204, 21, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  riviera: {
    name: 'Riviera',
    light: '#ddecfa',
    dark: '#6ea3f2',
    border: '#3b74c4',
    highlight: 'rgba(244, 63, 94, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  iceberg: {
    name: 'Iceberg',
    light: '#f0f4f8',
    dark: '#a0b3c6',
    border: '#62788e',
    highlight: 'rgba(14, 165, 233, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  honeymoon: {
    name: 'Honeymoon',
    light: '#f9e4c8',
    dark: '#d68d45',
    border: '#a26224',
    highlight: 'rgba(234, 179, 8, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  lavender: {
    name: 'Lavender',
    light: '#f3eaf8',
    dark: '#a084bd',
    border: '#70538f',
    highlight: 'rgba(250, 204, 21, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  sepia: {
    name: 'Sepia',
    light: '#ede4db',
    dark: '#cbb39d',
    border: '#8f7762',
    highlight: 'rgba(245, 158, 11, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  redsquare: {
    name: 'Red Square',
    light: '#f8ebd9',
    dark: '#de6f5e',
    border: '#ab3e2e',
    highlight: 'rgba(251, 191, 36, 0.45)',
    check: 'rgba(225, 29, 72, 0.8)'
  },
  alabaster: {
    name: 'Alabaster Luxury',
    light: '#fbfaf8',
    dark: '#e5dbcc',
    border: '#c5b49a',
    highlight: 'rgba(212, 175, 55, 0.45)',
    check: 'rgba(225, 29, 72, 0.75)',
    isLight: true
  },
  marble: {
    name: 'Carrara Marble',
    light: '#f8fafc',
    dark: '#94a3b8',
    border: '#475569',
    highlight: 'rgba(56, 189, 248, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)',
    isLight: true
  },
  emerald: {
    name: 'Emerald Royale',
    light: '#ebecd0',
    dark: '#4e7c4f',
    border: '#2d4a2d',
    highlight: 'rgba(250, 204, 21, 0.45)',
    check: 'rgba(239, 68, 68, 0.75)'
  },
  obsidian: {
    name: 'Obsidian Gold',
    light: '#334155',
    dark: '#0f172a',
    border: '#b45309',
    highlight: 'rgba(234, 179, 8, 0.55)',
    check: 'rgba(239, 68, 68, 0.85)'
  }
};

export function PieceIcon({ piece, color, size = 42, theme = 'alexander', colorPalette = 'classic' }) {
  if (!piece) return null;
  const isWhite = color === 'w';
  const palette = PIECE_COLOR_PALETTES[colorPalette] || PIECE_COLOR_PALETTES.classic;

  let fill = isWhite ? palette.white : palette.black;
  let stroke = isWhite ? palette.whiteStroke : palette.blackStroke;
  let strokeW = '1.5';
  let innerShade = isWhite ? '#f8fafc' : '#0f172a';

  if (theme === 'william') {
    strokeW = '2.2';
  } else if (theme === 'napoleon') {
    fill = isWhite ? '#f1f5f9' : '#334155';
    stroke = isWhite ? '#475569' : '#0f172a';
  } else if (theme === 'joanna') {
    fill = isWhite ? '#fef08a' : '#1c1917';
    stroke = isWhite ? '#854d0e' : '#44403c';
  }

  switch (piece.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeW}
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
          <g fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
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
          <g fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.95 1.23-1.5 1.5-1 0-2.06 1.15-2.5-.5-.45-1.69 1-3.69 2.5-4.5 2-1 3.5-3.5 3.5-6.5 0-2.8 1.5-5.5 3.5-7 2.5-2 5.5-2 7.5-1.5z" />
            <circle cx="15.5" cy="19.5" r="1.5" fill={isWhite ? stroke : '#ffffff'} />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            <path d="M17.5 26h10M22.5 21v10" fill="none" stroke={stroke} strokeWidth={strokeW} />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg width={size} height={size} viewBox="0 0 45 45" className="drop-shadow-md select-none pointer-events-none">
          <g fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
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
          <g fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" stroke={stroke} strokeWidth={strokeW} fill="none" />
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
