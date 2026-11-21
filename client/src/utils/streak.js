/**
 * Genuine Daily Login & Match Streak Tracking System
 * Starts genuinely from 1, tracks consecutive days accurately.
 */

import { safeStorage } from './storage.js';

const STREAK_COUNT_KEY = 'chess_streak_count';
const STREAK_LAST_DATE_KEY = 'chess_streak_last_date';
const STREAK_HISTORY_KEY = 'chess_streak_history';
const STREAK_CLAIMED_DATE_KEY = 'chess_streak_claimed_date';

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recordDateInHistory(dateStr) {
  try {
    const raw = safeStorage.getItem(STREAK_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    if (!history.includes(dateStr)) {
      history.push(dateStr);
      if (history.length > 60) history.shift();
      safeStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(history));
    }
  } catch {}
}

/**
 * Reads, verifies, and advances the genuine daily streak.
 * Guarantees a clean start at 1 for new or migrated users.
 */
export function getStreakInfo() {
  const todayStr = getLocalDateString();
  const savedCount = safeStorage.getItem(STREAK_COUNT_KEY);
  const lastDateStr = safeStorage.getItem(STREAK_LAST_DATE_KEY);

  // If first time or uninitialized
  if (!lastDateStr || !savedCount) {
    const initialStreak = 1;
    safeStorage.setItem(STREAK_COUNT_KEY, String(initialStreak));
    safeStorage.setItem(STREAK_LAST_DATE_KEY, todayStr);
    recordDateInHistory(todayStr);
    return {
      streak: initialStreak,
      lastDate: todayStr,
      isCheckedInToday: true,
      claimedToday: safeStorage.getItem(STREAK_CLAIMED_DATE_KEY) === todayStr
    };
  }

  // Parse YYYY-MM-DD to avoid timezone shifting
  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [lY, lM, lD] = lastDateStr.split('-').map(Number);
  const todayObj = new Date(tY, tM - 1, tD);
  const lastObj = new Date(lY, lM - 1, lD);
  const diffDays = Math.round((todayObj.getTime() - lastObj.getTime()) / (1000 * 60 * 60 * 24));

  let currentStreak = parseInt(savedCount, 10);
  if (isNaN(currentStreak) || currentStreak < 1) {
    currentStreak = 1;
  }

  if (diffDays === 0) {
    // Active on the same day: maintain current streak
    recordDateInHistory(todayStr);
    return {
      streak: currentStreak,
      lastDate: todayStr,
      isCheckedInToday: true,
      claimedToday: safeStorage.getItem(STREAK_CLAIMED_DATE_KEY) === todayStr
    };
  } else if (diffDays === 1) {
    // Consecutive day login! Streak advances by 1
    currentStreak += 1;
    safeStorage.setItem(STREAK_COUNT_KEY, String(currentStreak));
    safeStorage.setItem(STREAK_LAST_DATE_KEY, todayStr);
    recordDateInHistory(todayStr);
    return {
      streak: currentStreak,
      lastDate: todayStr,
      isCheckedInToday: true,
      claimedToday: safeStorage.getItem(STREAK_CLAIMED_DATE_KEY) === todayStr
    };
  } else {
    // Missed 1 or more days: Streak resets genuinely back to 1
    currentStreak = 1;
    safeStorage.setItem(STREAK_COUNT_KEY, '1');
    safeStorage.setItem(STREAK_LAST_DATE_KEY, todayStr);
    recordDateInHistory(todayStr);
    return {
      streak: 1,
      lastDate: todayStr,
      isCheckedInToday: true,
      claimedToday: safeStorage.getItem(STREAK_CLAIMED_DATE_KEY) === todayStr
    };
  }
}

/**
 * Claim daily streak XP bonus
 */
export function claimDailyStreakReward() {
  const todayStr = getLocalDateString();
  safeStorage.setItem(STREAK_CLAIMED_DATE_KEY, todayStr);
  return getStreakInfo();
}

/**
 * Returns 7-day status of the current week (Monday through Sunday)
 */
export function getWeeklyDaysStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  let history = [];
  try {
    const raw = safeStorage.getItem(STREAK_HISTORY_KEY);
    if (raw) history = JSON.parse(raw);
  } catch {}

  const todayStr = getLocalDateString(now);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return dayNames.map((name, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = getLocalDateString(d);
    const isToday = dateStr === todayStr;
    const isCompleted = history.includes(dateStr) || isToday;

    return {
      day: name,
      dateStr,
      isToday,
      completed: isCompleted,
      label: `Day ${idx + 1}`
    };
  });
}
