/**
 * Social Automation & Dynamic Notifications Engine
 * Handles first-open notifications, anime girl friend requests,
 * random 3-10 minute game challenges, daily friend requests, and permanent friend persistence.
 */

import { safeStorage } from './storage.js';

export const ANIME_FEMALE_CHARACTERS = [
  {
    id: 'anime_nezuko',
    username: 'Nezuko Kamado',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NezukoKamado&hair=long01&hairColor=2e151b&skinColor=f8d25c&radius=50',
    country: 'JP',
    elo: 1850,
    title: 'Demon Princess 🌸',
    anime: 'Demon Slayer',
    bio: 'Mmh mmph! Learning chess tactics with Tanjiro! 🌸'
  },
  {
    id: 'anime_yor',
    username: 'Yor Forger',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=YorForger&hair=long02&hairColor=18181b&skinColor=ecad80&radius=50',
    country: 'DE',
    elo: 2120,
    title: 'Thorn Princess 🌹',
    anime: 'Spy x Family',
    bio: 'A swift, lethal tactical strike on the chessboard.'
  },
  {
    id: 'anime_mikasa',
    username: 'Mikasa Ackerman',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MikasaAckerman&hair=short01&hairColor=18181b&skinColor=ecad80&radius=50',
    country: 'JP',
    elo: 1980,
    title: 'Blade of Eldia 🗡️',
    anime: 'Attack on Titan',
    bio: 'This board is cruel... but I will protect the King.'
  },
  {
    id: 'anime_anya',
    username: 'Anya Forger',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AnyaForger&hair=short03&hairColor=f472b6&skinColor=fde047&radius=50',
    country: 'DE',
    elo: 820,
    title: 'Telepathic Star ⭐',
    anime: 'Spy x Family',
    bio: 'Anya reads your secret moves! Waku waku!'
  },
  {
    id: 'anime_hinata',
    username: 'Hinata Hyuga',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HinataHyuga&hair=long03&hairColor=1e1b4b&skinColor=fde047&radius=50',
    country: 'JP',
    elo: 1740,
    title: 'Byakugan Guardian 🥋',
    anime: 'Naruto',
    bio: 'I will never give up on my chess way!'
  }
];

export const GENERAL_CHALLENGERS = [
  {
    id: 'f_hikaru',
    username: 'Hikaru_N',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HikaruNakamura',
    country: 'US',
    elo: 2875,
    title: 'Blitz Maestro',
    bio: 'Speed chess streamer & Super GM'
  },
  {
    id: 'f_magnus',
    username: 'Magnus_C',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MagnusCarlsen',
    country: 'NO',
    elo: 2882,
    title: 'World Champion',
    bio: 'Former 5x World Chess Champion'
  },
  {
    id: 'anime_tanjiro',
    username: 'Tanjiro Kamado',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tanjiro&hair=short02&hairColor=851e3e&skinColor=f8d25c&radius=50',
    country: 'JP',
    elo: 820,
    title: 'Water Breathing Cadet',
    bio: 'Turn your feelings into your chess moves!'
  },
  {
    id: 'anime_levi',
    username: 'Levi_Captain',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeviAckerman&hair=short01&hairColor=0f172a&skinColor=ecad80&radius=50',
    country: 'DE',
    elo: 2480,
    title: 'Humanity\'s Strongest',
    bio: 'No regrets on the board. Make your move.'
  },
  {
    id: 'sug_elena',
    username: 'Elena_Tactics',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaChess',
    country: 'IT',
    elo: 1720,
    title: 'Tactical Maestro',
    bio: 'Sicilian & Italian opening master'
  },
  {
    id: 'sug_arjun',
    username: 'Arjun_Grandmaster',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ArjunErigaisi',
    country: 'IN',
    elo: 2802,
    title: 'Super GM',
    bio: 'Aggressive attacking chess & tactical fire'
  },
  ...ANIME_FEMALE_CHARACTERS
];

const NOTIFICATIONS_STORAGE_KEY = 'chess_arena_notifications_v3';
const INITIAL_SEEDED_KEY = 'chess_arena_initial_notifs_seeded_v3';
const DISMISSED_NOTIFS_KEY = 'chess_arena_dismissed_notifs_v3';
const APP_OPEN_COUNT_KEY = 'chess_arena_app_open_count';
const LAST_NOTIF_TIME_KEY = 'chess_arena_last_notif_time_v3';
const NEXT_OPEN_TARGET_KEY = 'chess_arena_next_open_target_v3';
const FRIENDS_STORAGE_KEY = 'chess_arena_friends_v3';
const BLOCKED_STORAGE_KEY = 'chess_arena_blocked_friends_v3';

/**
 * Reads list of dismissed/handled notification IDs and usernames
 */
export function getDismissedNotifications() {
  try {
    const raw = safeStorage.getItem(DISMISSED_NOTIFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Permanently marks a notification as dismissed/accepted/declined so it NEVER returns
 */
export function markNotificationDismissed(notifOrId) {
  if (!notifOrId) return;
  const id = typeof notifOrId === 'string' ? notifOrId : notifOrId?.id;
  const username = typeof notifOrId === 'object' ? notifOrId?.fromUser?.username : null;
  const current = getDismissedNotifications();
  const set = new Set(current);
  if (id) set.add(id);
  if (username) set.add(`user_${username.toLowerCase()}`);
  safeStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify([...set]));
}

/**
 * Returns initial 3 notifications for a brand-new user or fresh launch:
 * 1. Hikaru 3m Blitz challenge
 * 2. Magnus 5m Blitz challenge
 * 3. Nezuko Kamado (Anime Girl) friend request
 * Never includes items already in friends or dismissed.
 */
export function getInitialNotifications() {
  const friends = getStoredFriends();
  const friendUsernames = new Set(friends.map(f => f.username?.toLowerCase()));
  const dismissed = new Set(getDismissedNotifications());

  const nezuko = ANIME_FEMALE_CHARACTERS[0]; // Nezuko Kamado
  const hikaru = GENERAL_CHALLENGERS[0];    // Hikaru
  const magnus = GENERAL_CHALLENGERS[1];    // Magnus

  const list = [];

  if (!dismissed.has('notif_hikaru_init') && !dismissed.has(`user_${hikaru.username.toLowerCase()}`)) {
    list.push({
      id: 'notif_hikaru_init',
      type: 'challenge',
      fromUser: {
        id: hikaru.id,
        username: hikaru.username,
        avatar: hikaru.avatar,
        elo: hikaru.elo,
        country: hikaru.country,
        title: hikaru.title
      },
      message: 'Challenged you to a 3-minute Blitz game! ⚔️',
      time: 'Just now',
      config: {
        timeControl: { baseMinutes: 3, incrementSeconds: 0 },
        colorPreference: 'random'
      }
    });
  }

  if (!dismissed.has('notif_magnus_init') && !dismissed.has(`user_${magnus.username.toLowerCase()}`)) {
    list.push({
      id: 'notif_magnus_init',
      type: 'challenge',
      fromUser: {
        id: magnus.id,
        username: magnus.username,
        avatar: magnus.avatar,
        elo: magnus.elo,
        country: magnus.country,
        title: magnus.title
      },
      message: 'Challenged you to a 5-minute Blitz game! ⚔️',
      time: '2m ago',
      config: {
        timeControl: { baseMinutes: 5, incrementSeconds: 0 },
        colorPreference: 'random'
      }
    });
  }

  // Only include Nezuko if not already added to friends and not dismissed!
  if (!friendUsernames.has(nezuko.username.toLowerCase()) &&
      !dismissed.has('notif_nezuko_init') &&
      !dismissed.has(`user_${nezuko.username.toLowerCase()}`)) {
    list.push({
      id: 'notif_nezuko_init',
      type: 'friend_request',
      fromUser: {
        id: nezuko.id,
        username: nezuko.username,
        avatar: nezuko.avatar,
        elo: nezuko.elo,
        country: nezuko.country,
        title: nezuko.title,
        anime: nezuko.anime,
        bio: nezuko.bio
      },
      message: '🌸 Nezuko Kamado sent you a friend request to connect & play chess!',
      time: 'Just now'
    });
  }

  return list;
}

/**
 * Creates a random 3-10 minute match challenge from an exciting opponent
 */
export function generateRandomChallenge(existingNotifs = []) {
  const friends = getStoredFriends();
  const dismissed = new Set(getDismissedNotifications());
  const existingUsernames = new Set([
    ...existingNotifs.map(n => n.fromUser?.username?.toLowerCase()),
    ...friends.map(f => f.username?.toLowerCase()),
    ...[...dismissed].filter(d => d.startsWith('user_')).map(d => d.replace('user_', '').toLowerCase())
  ]);

  const available = GENERAL_CHALLENGERS.filter(c => !existingUsernames.has(c.username.toLowerCase()));
  const candidate = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : GENERAL_CHALLENGERS[Math.floor(Math.random() * GENERAL_CHALLENGERS.length)];

  const timeOptions = [3, 5, 10];
  const minutes = timeOptions[Math.floor(Math.random() * timeOptions.length)];
  const formatName = minutes <= 5 ? 'Blitz' : 'Rapid';

  return {
    id: `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'challenge',
    fromUser: {
      id: candidate.id,
      username: candidate.username,
      avatar: candidate.avatar,
      elo: candidate.elo,
      country: candidate.country,
      title: candidate.title,
      bio: candidate.bio
    },
    message: `Challenged you to a ${minutes}-minute ${formatName} match! ⚔️`,
    time: 'Just now',
    config: {
      timeControl: { baseMinutes: minutes, incrementSeconds: 0 },
      colorPreference: 'random'
    }
  };
}

/**
 * Process App Open:
 * 1. Checks open count
 * 2. If 1st open: delivers initial 2 match challenges + 1 anime girl friend request (EXACTLY ONCE)
 * 3. Subsequent notifications: delivered ONLY after opening the app 5-7 times AND after several hours have passed
 */
export function processAppOpenNotifications(currentNotifs = []) {
  let openCount = parseInt(safeStorage.getItem(APP_OPEN_COUNT_KEY) || '0', 10);
  openCount += 1;
  safeStorage.setItem(APP_OPEN_COUNT_KEY, String(openCount));

  const dismissed = new Set(getDismissedNotifications());
  const friends = getStoredFriends();
  const friendUsernames = new Set(friends.map(f => f.username?.toLowerCase()));

  // Filter current notifications to permanently exclude any dismissed or already friended items
  let notifs = Array.isArray(currentNotifs)
    ? currentNotifs.filter(n => {
        if (!n || dismissed.has(n.id)) return false;
        const lowerName = n.fromUser?.username?.toLowerCase();
        if (lowerName && dismissed.has(`user_${lowerName}`)) return false;
        if (n.type === 'friend_request' && lowerName && friendUsernames.has(lowerName)) return false;
        return true;
      })
    : [];

  const isInitialSeeded = safeStorage.getItem(INITIAL_SEEDED_KEY) === 'true';

  // First time launch: Initialize with the 3 notifications once and set target 5-7 opens in future
  if (!isInitialSeeded) {
    safeStorage.setItem(INITIAL_SEEDED_KEY, 'true');
    const initial = getInitialNotifications();
    notifs = initial;
    safeStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    // Set next notification target: 5 to 7 opens in future
    const nextTarget = openCount + Math.floor(5 + Math.random() * 3);
    safeStorage.setItem(NEXT_OPEN_TARGET_KEY, String(nextTarget));
    safeStorage.setItem(LAST_NOTIF_TIME_KEY, String(Date.now()));
    return notifs;
  }

  // Subsequent opens:
  // ONLY generate another notification after opening the app 5-7 times AND after several hours/days have passed
  const targetOpen = parseInt(safeStorage.getItem(NEXT_OPEN_TARGET_KEY) || '0', 10);
  const lastTime = parseInt(safeStorage.getItem(LAST_NOTIF_TIME_KEY) || '0', 10);
  const now = Date.now();
  const hoursSinceLast = lastTime > 0 ? (now - lastTime) / (1000 * 60 * 60) : 999;

  // Initialize targetOpen if missing
  if (targetOpen === 0) {
    const nextTarget = openCount + Math.floor(5 + Math.random() * 3);
    safeStorage.setItem(NEXT_OPEN_TARGET_KEY, String(nextTarget));
    safeStorage.setItem(LAST_NOTIF_TIME_KEY, String(now));
    safeStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    return notifs;
  }

  const reachedOpens = openCount >= targetOpen;
  const reachedHours = hoursSinceLast >= 3; // at least 3-4 hours or days

  if (reachedOpens && reachedHours) {
    // Schedule next target: 5 to 7 opens in future
    const nextTarget = openCount + Math.floor(5 + Math.random() * 3);
    safeStorage.setItem(NEXT_OPEN_TARGET_KEY, String(nextTarget));
    safeStorage.setItem(LAST_NOTIF_TIME_KEY, String(now));

    const blocked = getBlockedFriends();
    const existingUsernames = new Set([
      ...notifs.map(n => n.fromUser?.username?.toLowerCase()),
      ...friends.map(f => f.username?.toLowerCase()),
      ...blocked.map(b => (typeof b === 'string' ? b.toLowerCase() : '')),
      ...[...dismissed].filter(d => d.startsWith('user_')).map(d => d.replace('user_', '').toLowerCase())
    ]);

    // 50/50 chance of match challenge vs friend request
    const isChallenge = Math.random() < 0.5;

    if (isChallenge) {
      const available = GENERAL_CHALLENGERS.filter(c => !existingUsernames.has(c.username.toLowerCase()));
      const candidate = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : GENERAL_CHALLENGERS[Math.floor(Math.random() * GENERAL_CHALLENGERS.length)];

      const timeOptions = [3, 5, 10];
      const minutes = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      const formatName = minutes <= 5 ? 'Blitz' : 'Rapid';

      notifs.unshift({
        id: `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'challenge',
        fromUser: {
          id: candidate.id,
          username: candidate.username,
          avatar: candidate.avatar,
          elo: candidate.elo,
          country: candidate.country,
          title: candidate.title,
          bio: candidate.bio
        },
        message: `Challenged you to a ${minutes}-minute ${formatName} match! ⚔️`,
        time: 'Just now',
        config: {
          timeControl: { baseMinutes: minutes, incrementSeconds: 0 },
          colorPreference: 'random'
        }
      });
    } else {
      // Friend request from anime girl or master
      const available = GENERAL_CHALLENGERS.filter(c => !existingUsernames.has(c.username.toLowerCase()));
      if (available.length > 0) {
        const candidate = available[Math.floor(Math.random() * available.length)];
        const isAnime = Boolean(candidate.anime);

        notifs.unshift({
          id: `friend_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'friend_request',
          fromUser: {
            id: candidate.id,
            username: candidate.username,
            avatar: candidate.avatar,
            elo: candidate.elo,
            country: candidate.country,
            title: candidate.title,
            anime: candidate.anime,
            bio: candidate.bio
          },
          message: `${isAnime ? '🌸' : '👥'} ${candidate.username} sent you a friend request to connect & play!`,
          time: 'Just now'
        });
      }
    }

    if (notifs.length > 25) {
      notifs = notifs.slice(0, 25);
    }
  }

  safeStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  return notifs;
}

/**
 * Reads stored friends list
 */
export function getStoredFriends() {
  try {
    const raw = safeStorage.getItem(FRIENDS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Reads blocked friends list
 */
export function getBlockedFriends() {
  try {
    const raw = safeStorage.getItem(BLOCKED_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Permanently adds a friend to the user's friend list
 */
export function addFriendPermanently(userObj) {
  if (!userObj || !userObj.username) return getStoredFriends();
  const current = getStoredFriends();

  // If already exists, do not duplicate
  if (current.some(f => f.username === userObj.username)) {
    return current;
  }

  const newFriend = {
    id: userObj.id || `f_${Date.now()}`,
    username: userObj.username,
    avatar: userObj.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userObj.username}`,
    country: userObj.country || 'JP',
    elo: Number(userObj.elo) || 1850,
    title: userObj.title || 'Mutual Friend',
    isOnline: true,
    statusText: `Online • ${userObj.title || 'Ready to play'}`,
    bio: userObj.bio || 'Chess friend from Arena',
    anime: userObj.anime || null,
    isBot: Boolean(userObj.isBot || userObj.anime || userObj.id?.startsWith('anime_') || userObj.id?.startsWith('f_') || userObj.id?.startsWith('sug_')),
    addedAt: Date.now()
  };

  const updated = [newFriend, ...current];
  safeStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Permanently removes a friend from the friend list
 */
export function removeFriendPermanently(friendIdOrUsername) {
  const current = getStoredFriends();
  const updated = current.filter(
    f => f.id !== friendIdOrUsername && f.username !== friendIdOrUsername
  );
  safeStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Blocks a friend and permanently removes them from the friend list
 */
export function blockFriendPermanently(friendIdOrUsername) {
  const blocked = getBlockedFriends();
  if (!blocked.includes(friendIdOrUsername)) {
    blocked.push(friendIdOrUsername);
    safeStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify(blocked));
  }
  return removeFriendPermanently(friendIdOrUsername);
}
