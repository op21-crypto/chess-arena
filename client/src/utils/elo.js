/**
 * Elo Rating Calculation, Starting Tiers & Rank Classification System
 */

export const STARTING_ELO_OPTIONS = [
  {
    elo: 800,
    label: 'Beginner',
    title: 'Novice Tactician',
    icon: '🥉',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    desc: 'Learning piece movement, rules, and fundamental pawn captures.'
  },
  {
    elo: 1200,
    label: 'Intermediate',
    title: 'Club Competitor',
    icon: '🥈',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    desc: 'Knows opening principles, basic tactics like forks, pins, and skewers.'
  },
  {
    elo: 1600,
    label: 'Advanced',
    title: 'Tournament Player',
    icon: '🥇',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    desc: 'Solid positional strategy, sharp tactical calculation, and endgame plans.'
  },
  {
    elo: 2000,
    label: 'Master',
    title: 'Candidate Master',
    icon: '💎',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    desc: 'Expert level, deep opening preparation, and flawless endgame technique.'
  },
  {
    elo: 2500,
    label: 'Grandmaster',
    title: 'Grandmaster Elite',
    icon: '👑',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    desc: 'Elite masterclass standard competing at highest international levels.'
  }
];

/**
 * Returns rank tier metadata based on active Elo score
 */
export function getRankTier(elo = 1200) {
  const numericElo = Number(elo) || 1200;
  if (numericElo >= 2500) {
    return {
      name: 'Grandmaster',
      shortTitle: 'GM',
      icon: '👑',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      pillClass: 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black'
    };
  }
  if (numericElo >= 2200) {
    return {
      name: 'National Master',
      shortTitle: 'NM',
      icon: '🏆',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      pillClass: 'bg-amber-500 text-slate-950 font-black'
    };
  }
  if (numericElo >= 1800) {
    return {
      name: 'Candidate Master',
      shortTitle: 'CM',
      icon: '💎',
      badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
      pillClass: 'bg-indigo-500 text-white font-bold'
    };
  }
  if (numericElo >= 1500) {
    return {
      name: 'Class A Player',
      shortTitle: 'ADV',
      icon: '🥇',
      badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      pillClass: 'bg-purple-500 text-white font-bold'
    };
  }
  if (numericElo >= 1100) {
    return {
      name: 'Intermediate',
      shortTitle: 'INT',
      icon: '🥈',
      badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      pillClass: 'bg-blue-500 text-white font-bold'
    };
  }
  return {
    name: 'Novice',
    shortTitle: 'NOV',
    icon: '🥉',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    pillClass: 'bg-emerald-500 text-white font-bold'
  };
}

/**
 * Calculates standard Elo rating delta for a match.
 * @param {number} playerElo Current player Elo
 * @param {number} oppElo Opponent Elo
 * @param {'win' | 'loss' | 'draw' | number} result Result
 * @param {number} kFactor Rating sensitivity factor (default 32)
 * @returns {number} Integer rating delta (+/-)
 */
export function calculateEloDelta(playerElo, oppElo, result, kFactor = 32) {
  const rPlayer = Number(playerElo) || 1200;
  const rOpp = Number(oppElo) || 1200;

  let score = 0.5;
  if (result === 'win' || result === 1) score = 1;
  else if (result === 'loss' || result === 0) score = 0;
  else if (result === 'draw' || result === 0.5) score = 0.5;

  const expectedScore = 1 / (1 + Math.pow(10, (rOpp - rPlayer) / 400));
  let delta = Math.round(kFactor * (score - expectedScore));

  // Guaranteed minimum movement so matches always feel impactful
  if (score === 1 && delta < 8) delta = 8;
  if (score === 0 && delta > -8) delta = -8;

  return delta;
}

/**
 * Determine time control format name (bullet, blitz, rapid, classical)
 */
export function getFormatFromTimeControl(tc) {
  if (!tc || !tc.baseMinutes) return 'rapid';
  const mins = Number(tc.baseMinutes);
  if (mins < 3) return 'bullet';
  if (mins < 10) return 'blitz';
  if (mins <= 30) return 'rapid';
  return 'classical';
}
