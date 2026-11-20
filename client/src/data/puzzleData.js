import { ALL_LESSONS } from './lessonsData.js';
import { getLeaderboard } from './leaderboardData.js';
import { ALL_PUZZLES } from './puzzleDatabase.js';

export const CHESS_PUZZLES = ALL_PUZZLES;

export const CHESS_LESSONS = ALL_LESSONS;

export const DEFAULT_LEADERBOARD = getLeaderboard('world', 'rapid');
