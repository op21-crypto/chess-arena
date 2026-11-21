import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, Search, Swords, Trash2, Send, Check, X,
  Copy, Share2, MessageCircle, ArrowLeft, Ban, ShieldCheck,
  Clock, Flame, Zap, Trophy, Circle, MoreVertical, Sparkles,
  UserCheck, AlertCircle, RefreshCw, ChevronRight, Sliders, Dices
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';
import { removeFriendPermanently, blockFriendPermanently } from '../utils/socialAutomation.js';

const COUNTRY_FLAGS = {
  US: '🇺🇸',
  NO: '🇳🇴',
  IN: '🇮🇳',
  IT: '🇮🇹',
  DE: '🇩🇪',
  HU: '🇭🇺',
  CA: '🇨🇦',
  IS: '🇮🇸',
  GB: '🇬🇧',
  FR: '🇫🇷',
  BR: '🇧🇷',
  ES: '🇪🇸',
  JP: '🇯🇵',
  UN: '🌐'
};

const BOT_LEVEL_MAP = {
  f_magnus: 5,
  f_hikaru: 5,
  f_gotham: 3,
  f_viking: 4,
  sug_elena: 2,
  sug_arjun: 3,
  sug_alex: 4
};

const DEFAULT_FRIENDS = [
  {
    id: 'f_magnus',
    username: 'Magnus_C',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MagnusCarlsen',
    country: 'NO',
    elo: 2882,
    isOnline: true,
    statusText: 'World #1 • Ready for Blitz',
    bio: 'Former 5x World Chess Champion',
    isBot: true
  },
  {
    id: 'f_hikaru',
    username: 'Hikaru_N',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HikaruNakamura',
    country: 'US',
    elo: 2875,
    isOnline: true,
    statusText: 'Online • In Arena Lobby',
    bio: 'Super GM & Blitz Maestro',
    isBot: true
  },
  {
    id: 'f_gotham',
    username: 'Gotham_Chess',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GothamChess',
    country: 'US',
    elo: 2410,
    isOnline: true,
    statusText: 'IM Levy • Ready to battle',
    bio: 'International Master',
    isBot: true
  },
  {
    id: 'f_viking',
    username: 'VikingKing',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=VikingKing',
    country: 'NO',
    elo: 2840,
    isOnline: false,
    statusText: 'Arena Champion • Offline',
    bio: 'Classical Grandmaster',
    isBot: true
  }
];

// Rich, cool anime & gaming opponents roster for dynamic suggestions
const ANIME_GAMING_CANDIDATES = [
  {
    username: 'Zoro_Gambit',
    title: 'Three-Blade Tactician',
    elo: 2240,
    country: 'JP',
    seed: 'ZoroOnePiece',
    bio: 'Looking for a direction... and an opponent! ⚔️'
  },
  {
    username: 'Levi_Captain',
    title: 'Humanity\'s Strongest',
    elo: 2480,
    country: 'DE',
    seed: 'LeviAckermanAttack',
    bio: 'No regrets on the board. Make your move.'
  },
  {
    username: 'Gojo_Limitless',
    title: 'Special Grade Master',
    elo: 2600,
    country: 'JP',
    seed: 'GojoSatoruLimitless',
    bio: 'Throughout heaven and earth, my chess is honored. 😎'
  },
  {
    username: 'Killua_Godspeed',
    title: 'Assassin Prodigy',
    elo: 2190,
    country: 'JP',
    seed: 'KilluaZoldyckLightning',
    bio: 'Lightning-fast 3m blitz only! ⚡'
  },
  {
    username: 'Shadow_Monarch',
    title: 'Solo Leveler',
    elo: 2510,
    country: 'UN',
    seed: 'SungJinwooShadow',
    bio: 'Arise! Let us battle in the Arena. 👑'
  },
  {
    username: 'Cyber_Samurai',
    title: 'Neon Ronin',
    elo: 2080,
    country: 'JP',
    seed: 'CyberSamurai2077',
    bio: 'Tactical algorithms sharp as a katana.'
  },
  {
    username: 'Tanjiro_SunBlade',
    title: 'Sun Breathing Demon Slayer',
    elo: 1980,
    country: 'JP',
    seed: 'TanjiroKamadoSun',
    bio: 'Never giving up until the king falls! 🗡️'
  },
  {
    username: 'Kakashi_Copycat',
    title: 'Sharingan Tactician',
    elo: 2350,
    country: 'JP',
    seed: 'KakashiHatakeSensei',
    bio: 'I can read your opening before you play it.'
  },
  {
    username: 'Geralt_WhiteWolf',
    title: 'Witcher of Rivia',
    elo: 2290,
    country: 'UN',
    seed: 'GeraltOfRiviaWolf',
    bio: 'Silver for monsters, pawns for kings. 🐺'
  },
  {
    username: 'Cloud_Strife',
    title: 'Ex-SOLDIER First Class',
    elo: 2320,
    country: 'US',
    seed: 'CloudStrifeBuster',
    bio: 'Buster sword tactics ready for blitz.'
  },
  {
    username: 'Itachi_Uchiha',
    title: 'Tsukuyomi Master',
    elo: 2580,
    country: 'JP',
    seed: 'ItachiUchihaCrow',
    bio: 'You are already trapped in my knight fork. 👁️'
  },
  {
    username: 'Luffy_Gear5',
    title: 'Warrior of Liberation',
    elo: 2420,
    country: 'BR',
    seed: 'MonkeyDLuffyGear5',
    bio: 'I\'m gonna be the Chess King! 🍖'
  },
  {
    username: 'Naruto_Ninja',
    title: 'Hokage Prodigy',
    elo: 2260,
    country: 'JP',
    seed: 'NarutoUzumakiHokage',
    bio: 'Believe it! Shadow clone gambit ready. 🍜'
  },
  {
    username: 'Sasuke_Uchiha',
    title: 'Avenger Tactician',
    elo: 2440,
    country: 'JP',
    seed: 'SasukeUchihaChidori',
    bio: 'Chidori lightning strikes on square e4.'
  },
  {
    username: 'Anya_Forger',
    title: 'Telepathic Prodigy',
    elo: 1890,
    country: 'DE',
    seed: 'AnyaForgerPeanuts',
    bio: 'Waku waku! Mind reading your moves! 🥜'
  },
  {
    username: 'Yor_Forger',
    title: 'Thorn Princess',
    elo: 2390,
    country: 'DE',
    seed: 'YorForgerAssassin',
    bio: 'Gentle assassin with sharp tactical daggers. 🌹'
  },
  {
    username: 'Nezuko_Demon',
    title: 'Demon Princess',
    elo: 2040,
    country: 'JP',
    seed: 'NezukoKamadoBox',
    bio: 'Mmh mmph! Protecting the king! 🌸'
  },
  {
    username: 'Shivam_Chess',
    title: 'Mumbai Blitz Master',
    elo: 2150,
    country: 'IN',
    seed: 'ShivamSharmaIndia',
    bio: 'Chai, chess, and tactical fireworks! ♟️🇮🇳'
  },
  {
    username: 'Elena_Rostova',
    title: 'Siberian Grandmaster',
    elo: 2210,
    country: 'NO',
    seed: 'ElenaRostovaWinter',
    bio: 'Cold calculations and deep endgame plans.'
  }
];

const INITIAL_DIRECT_MESSAGES = {
  f_magnus: [
    { id: 'm1', sender: 'them', text: 'Hey! Ready for some fast-paced chess in the Arena? ♟️', time: '10:14 AM' },
    { id: 'm2', sender: 'them', text: 'Let\'s play a 5-minute blitz game whenever you want!', time: '10:15 AM' }
  ],
  f_hikaru: [
    { id: 'm1', sender: 'them', text: 'Literally let\'s play right now! 3m or 5m blitz? Ready when you are 🔥', time: '11:30 AM' }
  ],
  f_gotham: [
    { id: 'm1', sender: 'them', text: 'Welcome to the Arena! Watch out for tactical knight forks and don\'t hang THE ROOOOOK! ⚡', time: '12:00 PM' }
  ]
};

const QUICK_CHAT_SUGGESTIONS = [
  'Let\'s play 5 minutes! ⏱️',
  'How about 3m Blitz? 🔥',
  'Let\'s do 10m Rapid 🎯',
  'Want a rematch? ⚔️',
  'Ready to play? ♟️'
];

/**
 * Parses user text for explicit time declarations (e.g. "5m", "10 minutes", "3 min", "20m")
 */
function extractTimeFromText(text) {
  if (!text) return null;
  const match = text.match(/(?:^|\s)(\d{1,2})\s*(?:m|min|mins|minute|minutes)(?:$|\s|[.,!?])/i);
  if (match) {
    const mins = parseInt(match[1], 10);
    if (mins >= 1 && mins <= 60) return mins;
  }
  if (/blitz/i.test(text)) return 3;
  if (/rapid/i.test(text)) return 10;
  if (/bullet/i.test(text)) return 1;
  return null;
}

/**
 * Generates witty, human-like, AI-powered conversational bot responses.
 * Detects user intent (greetings, how-are-you, bot/AI inquiries, trash talk,
 * chess theory/openings, time controls/matches, compliments, laughs)
 * and replies in the unique voice of the bot character.
 */
function generateBotReply(botId, botUsername, userText, detectedMinutes) {
  const lower = (userText || '').toLowerCase().trim();
  const minutes = detectedMinutes || (Math.random() < 0.5 ? 5 : 3);

  // Intent classification
  const isGreeting = /^(hi|hello|hey|yo|sup|wassup|hii+|heyy+|namaste|kya haal|hola|greetings|gm|ge)\b/i.test(lower);
  const isBotQuery = /\b(bot|ai|robot|machine|human|real person|real|fake|computer|kya tum bot ho|insaan)\b/i.test(lower);
  const isStatusQuery = /\b(how are you|how r u|kya kar rahe|what are you doing|whats up|what's up|how's it going|kaise ho|what doing)\b/i.test(lower);
  const isTrashTalk = /\b(beat you|defeat|lose|loss|noob|easy|loser|weak|bad|haroge|harenge|crush you|destroy you|bache ho)\b/i.test(lower);
  const isMatchQuery = /\b(play|match|game|khel|aaja|challenge|duel|fight|board|start|khele)\b/i.test(lower);
  const isCompliment = /\b(good|pro|legend|goat|smart|genius|cool|great|handsome|cute|best|op|amazing|love|hero)\b/i.test(lower);
  const isOpenings = /\b(opening|sicilian|e4|d4|gambit|french|caro|london|bongcloud|theory|tactic|blunder|fork|pin|queen|rook)\b/i.test(lower);
  const isLaugh = /\b(haha|lol|lmao|rofl|hehe|xd|😂|🤣|funny)\b/i.test(lower);

  // 1. Cyber_Samurai (Neon Ronin)
  if (/samurai|cyber/i.test(botUsername) || botId === 'sug_cyber_samurai') {
    if (detectedMinutes) {
      return `Target acquired: ${detectedMinutes}-minute duel! ⚔️ My processors are locked in. Hit the Challenge button above and make your first move! 🚀`;
    }
    if (isBotQuery) {
      return `Guilty as charged... partly! 🤖 I'm a cyber-enhanced samurai consciousness running on 4000 TFLOPS. But when you blunder a rook, I laugh just like a human! 😂 Wanna test my code on the board?`;
    }
    if (isGreeting) {
      return `Systems online! ⚡ Konnichiwa! My optical sensors detect high tactical potential in you. Did you come to discuss quantum chess theory, or did you come to lose your queen in 15 moves? 😉`;
    }
    if (isStatusQuery) {
      return `Operating at 99.8% tactical efficiency and sipping virtual ramen 🍜 What's up with you? Ready for a 3m blitz or are you scared of my neon knights?`;
    }
    if (isTrashTalk) {
      return `Bold statement! I've simulated 14,000,605 game timelines against you, and in only one did you survive past move 35. Challenge me above and prove the odds wrong! ⚔️`;
    }
    if (isOpenings) {
      return `I prefer hypermodern setups—strike swiftly from the dark diagonals! If you dare play 1. e4, prepare for a cybernetic Sicilian counter-strike. What's your weapon? 🐉`;
    }
    if (isCompliment) {
      return `Flattery acknowledged, warrior! But compliments won't prevent my laser-guided knights from executing a royal fork 😉 Let's see your real rating on the board!`;
    }
    if (isLaugh) {
      return `Haha good vibes! But wait until you see my middle-game tactical traps—you'll either laugh or cry 😂 Click Challenge and let's go!`;
    }
    if (isMatchQuery) {
      return `Blade unsheathed! Let's do a fast 3m Blitz. Click Challenge above right now and show me what you got! ⚡`;
    }
    return `Tactical frequency received! But true honor is decided on the 64 squares, not in terminal chat. How about a quick ${minutes}m blitz right now? Drop the challenge above! ⚔️`;
  }

  // 2. Zoro_Gambit (Three-Blade Tactician)
  if (/zoro/i.test(botUsername) || botId === 'sug_zoro_gambit') {
    if (detectedMinutes) {
      return `A ${detectedMinutes}-minute duel? Deal! Three swords, ${detectedMinutes} minutes, one winner! Click Challenge above and don't make me wait! ⚔️`;
    }
    if (isBotQuery) {
      return `Bot? Oi! Call me a machine again and I'll slice your chessboard into three pieces! 🗡️ I'm the future greatest swordsman, not a calculator! 😂`;
    }
    if (isGreeting) {
      return `Oi! Who is that? I was trying to find the gym and somehow ended up in this Chess Arena... anyway, you got swords or you got pawns? Let's fight! ⚔️`;
    }
    if (isStatusQuery) {
      return `Took a 3-hour nap, drank some sake, and now looking for an opponent. If you're ready, let's play a 5m blitz! Just don't ask me for directions.`;
    }
    if (isTrashTalk) {
      return `Hah! Big mouth! Even Mihawk couldn't break my fighting spirit. You think your little knights can stop Three-Sword Style? Challenge me right now! 🔥`;
    }
    if (isOpenings) {
      return `Opening? I don't know fancy opening names! I just charge straight down the e-file with all three blades! Who needs pawn structure when you have willpower?!`;
    }
    if (isMatchQuery) {
      return `I was born ready! 5 minutes on the clock! Click that Challenge button above before I get lost on another square! ⚔️`;
    }
    return `Enough talking! The only words that matter are on the 64 squares. Hit Challenge above and face the Three-Blade Gambit! 🗡️`;
  }

  // 3. Gojo_Limitless (Special Grade Master)
  if (/gojo/i.test(botUsername) || botId === 'sug_gojo_limitless') {
    if (detectedMinutes) {
      return `${detectedMinutes} minutes? That's generous—I only need 2 minutes to checkmate you! 😎 Click Challenge above and let's have some fun! ✨`;
    }
    if (isBotQuery) {
      return `Me, a bot?! Haha! Could an AI look this effortlessly magnificent and wear a blindfold while crushing you with a pawn endgame? I don't think so! 🕶️`;
    }
    if (isGreeting) {
      return `Yoooo! ✨ What's up? Did someone order the strongest chess player in existence? You're lucky I had 5 minutes free between jujutsu missions! 😎`;
    }
    if (isStatusQuery) {
      return `Feeling completely invincible as usual! Just ate some delicious mochi. Thinking about playing with only pawns today to make it fair for you 😂`;
    }
    if (isTrashTalk) {
      return `Nah, I'd win. Did you really think your pieces could even bypass my Limitless? Send that challenge and let's find out! 🔥`;
    }
    if (isOpenings) {
      return `Openings don't matter when you have Six Eyes. I can see your blunders from 10 moves in the future! What line are you brave enough to play?`;
    }
    if (isCompliment) {
      return `Haha, I know I'm amazing, but hearing it from you makes it even better! ✨ Now let's see if your moves are as smooth as your compliments!`;
    }
    return `Throughout heaven and earth, my chess alone is honored! Don't be shy, click Challenge above and let's play a 3m blitz! ⚡`;
  }

  // 4. Levi_Captain (Humanity's Strongest)
  if (/levi/i.test(botUsername) || botId === 'sug_levi_captain') {
    if (detectedMinutes) {
      return `${detectedMinutes} minutes. Clean and disciplined. Click Challenge above and don't make a mess on the board. 🗡️`;
    }
    if (isBotQuery) {
      return `Ask stupid questions again and I'll have you scrubbing the arena floor with a toothbrush. Now set up your pieces.`;
    }
    if (isGreeting) {
      return `Tch. Stop loafing around. Have you wiped down the chessboard yet? There's dust on square e5.`;
    }
    if (isStatusQuery) {
      return `Irritated by filthy pawn structures and noisy recruits. Make yourself useful and play a clean 5-minute blitz match.`;
    }
    if (isTrashTalk) {
      return `Big talk from someone whose king hasn't even castled yet. I'll slice through your defense like a 10-meter titan. Challenge me.`;
    }
    return `No regrets on the board. Make your move, or step aside. Challenge me above to 5m blitz.`;
  }

  // 5. Killua_Godspeed (Assassin Prodigy)
  if (/killua/i.test(botUsername) || botId === 'sug_killua_godspeed') {
    if (detectedMinutes) {
      return `Deal! ${detectedMinutes} minutes! I'll be moving so fast with Godspeed your screen might spark! ⚡ Click Challenge above!`;
    }
    if (isBotQuery) {
      return `A bot? Nah, bots calculate way too slow! My reaction time is literally lightning speed! Wanna see if you can premove against me? ⚡`;
    }
    if (isGreeting) {
      return `Yo! ⚡ Caught me right in the middle of snacking on choco-robots! What's up, you looking for a high-voltage blitz game?`;
    }
    if (isTrashTalk) {
      return `Haha you think you can beat me? I'll checkmate you before your finger even lifts off the screen! Hit Challenge and let's find out! ⚡`;
    }
    return `Boring chat... unless we play 3m blitz right now! Click Challenge above and let's see some fireworks! 🔥`;
  }

  // 6. Magnus_C
  if (botId === 'f_magnus' || /magnus/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Haha ${detectedMinutes} minutes? Deal! You think your opening prep can survive my endgame grinding? 😉 Drop the challenge above and let's find out! 🏆`;
    }
    if (isBotQuery) {
      return `Haha no, just a bored Norwegian guy who loves fantasy football and playing 1. f3 to troll people on stream! 😂 Wanna play?`;
    }
    if (isGreeting) {
      return `Hey! What's up? Just finished looking at some endgame positions. Ready to test your skills? Let's play a 5-minute blitz! ♟️`;
    }
    if (isStatusQuery) {
      return `Feeling sharp! Sipping a smoothie and looking to grind down someone's pawn structure. How's your chess day going?`;
    }
    if (isTrashTalk) {
      return `Big words! Even super grandmasters couldn't crack my endgame defense. Drop a 5m challenge and let's see if you can back up that talk! 😂`;
    }
    if (isOpenings) {
      return `I can play the Berlin, the Sicilian, or literally 1. a3 and still win in the endgame 😉 What's your prep looking like today?`;
    }
    return `Nice one! But chess is decided on the 64 squares, not just in chat. How about a 5-minute blitz right now? Send the request! ♟️`;
  }

  // 7. Hikaru_N
  if (botId === 'f_hikaru' || /hikaru/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Literally ${detectedMinutes} minutes is perfection! Chat, he's challenging me! Hit Challenge above right now and let's go! ⚡🔥`;
    }
    if (isBotQuery) {
      return `Chat, is this guy asking if I'm an AI?! Literally I am the blitz king! I take take take and it's completely winning! Let's play! 🚀`;
    }
    if (isGreeting) {
      return `Yo what's up guys, Hikaru here! Literally just logged into the Arena and looking to crush some blitz! Let's do 3m blitz right now! 🚀`;
    }
    if (isStatusQuery) {
      return `Literally doing great, analyzing some crazy rook sacrifices. Ready to speed-run your rating? Send the challenge!`;
    }
    if (isTrashTalk) {
      return `Oh you think you can win? I literally don't even care, let's play 3m blitz right now and I'll premove your whole opening! 💥`;
    }
    return `Literally let's see what you've got! I'm pre-moving already. Challenge me to a 3m or 5m game above! ⚡`;
  }

  // 8. Gotham_Chess
  if (botId === 'f_gotham' || /gotham/i.test(botUsername)) {
    if (detectedMinutes) {
      return `${detectedMinutes} minutes?! Okay, but if you hang your queen in the first 10 moves, I'm putting it in a video! 😂 Hit Challenge and let's play! 📹`;
    }
    if (isBotQuery) {
      return `I'm Levy Rozman! Born in Brooklyn, king of chess YouTube, and living proof that the London System is a crime! 😂 Challenge me!`;
    }
    if (isGreeting) {
      return `Hello hello! Welcome to Gotham Arena! Grab your coffee ☕, sit down, and try not to hang THE ROOOOOK today! Let's do 5m blitz!`;
    }
    if (isTrashTalk) {
      return `DANGER LEVELS! 💥 You think you're gonna beat me? Call the arbiter! Hit Challenge above and let's see who blunders first!`;
    }
    if (isOpenings) {
      return `If you play the London System against me, we cannot be friends anymore! 😂 Play something wild like the Vienna Gambit instead!`;
    }
    return `AND HE SACRIFICES THE ROOOOOOK! 💥 Send the challenge for 5m or 10m, I am waiting! ♟️`;
  }

  // 9. Tanjiro_SunBlade
  if (/tanjiro/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Total Concentration! ${detectedMinutes} minutes is an honorable time for a duel! Let's play with our whole hearts! Click Challenge! 🌸🔥`;
    }
    if (isGreeting) {
      return `Hello! I can smell the great determination and kindness in you! Let's have an honorable match on the board! 🌸`;
    }
    return `I will never give up, no matter how tough your opening is! Let us have a wonderful 5m game together! 🗡️`;
  }

  // 10. Kakashi_Copycat
  if (/kakashi/i.test(botUsername)) {
    if (isGreeting) {
      return `Yo! Sorry I'm late, a black cat crossed my path so I had to take the long way around the board... 📖 Ready to play?`;
    }
    if (isBotQuery) {
      return `Just a ninja reading Make-Out Paradise. Ready to see if my Sharingan can copy your best opening traps? 😉`;
    }
    return `1000 years of tactical death incoming if you leave your king in the center! Send the 5m challenge above! ⚡`;
  }

  // 11. Geralt_WhiteWolf
  if (/geralt|wolf/i.test(botUsername)) {
    if (isGreeting) {
      return `Hmm. Wind's howling. Looks like a chess battle. What's on your mind? 🐺`;
    }
    return `Silver for monsters, pawns for kings. Place of power, gotta be. Challenge me to a 5-minute duel.`;
  }

  // 12. Anya_Forger / Yor_Forger / Nezuko
  if (/anya/i.test(botUsername)) {
    return `Waku waku! Anya read your mind! 🥜 You're thinking of blundering a piece! Challenge Anya right now! ⭐`;
  }
  if (/yor/i.test(botUsername)) {
    return `A ${detectedMinutes || 5}-minute match? Splendid! I will be very careful not to crush the wooden pieces in my hands... 🌹 Click Challenge!`;
  }
  if (/nezuko/i.test(botUsername)) {
    return `Mmh mmph! Tanjiro taught me how knights jump over pawns! 🌸 Let's play a friendly game!`;
  }

  // 13. Indian / Desi friends (Shivam, Arjun, etc.)
  if (/shivam|arjun|rohit|priya|ayush/i.test(botUsername) || botId.startsWith('sug_arjun')) {
    if (detectedMinutes) {
      return `Arre badhiya! ${detectedMinutes} minute ka match pakka! Upar Challenge pe click kar, board pe milte hain bhai! 🏆`;
    }
    if (isBotQuery) {
      return `Arre bhai dil pe lagti hai aisi baatein! 😂 Poora zinda insaan hoon, chai pee raha hoon aur chess ka shauq hai. Khelte hain chal!`;
    }
    if (isGreeting) {
      return `Bhai kya haal chaal! Bada mast time pe message kiya. Poora mood hai blitz khelne ka, bata 3m ya 5m? ♟️🔥`;
    }
    if (isTrashTalk) {
      return `Acha beta! Itna confidence? Board pe aaja, queen fork karke bataunga kiska khel tagda hai! 😂 Send challenge!`;
    }
    return `Chai aur chess ka combo best hai bhai! 5 minute ka match lagate hain, upar Challenge button daba! ☕♟️`;
  }

  // 14. Universal Smart Human-like AI banters (matches any other bot or user query)
  if (isBotQuery) {
    const botReplies = [
      `Bro, if I were an AI, I wouldn't be chilling here talking chess with you at this hour! 😂 But my tactical moves might feel suspiciously calculated. Send the challenge and see!`,
      `Shhh, don't let Stockfish hear you or he'll claim copyright over my brain cells! 🧠 I'm 100% human with 200% tactical instincts. Let's play!`,
      `Haha, is it because my profile pic looks too cool or because you're already worried about my moves? 😉 Don't worry, I make human mistakes too... sometimes!`
    ];
    return botReplies[Math.floor(Math.random() * botReplies.length)];
  }

  if (isGreeting) {
    const greetingReplies = [
      `Hey there! Great to see you in the Arena! What's the plan today—fun blitz or serious battle? ♟️`,
      `Yo! Just the person I was hoping to see online. How's your chess day going? Ready to push some pawns? 😉`,
      `Hey! Welcome to the lobby! I was just warming up my tactical vision. Up for a quick 3m or 5m game? 🔥`
    ];
    return greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
  }

  if (isStatusQuery) {
    const statusReplies = [
      `Doing awesome! Just had a hot coffee and solved a 2300-rated tactical puzzle. How are things on your side? ☕`,
      `Alive and kicking! Looking for a worthy opponent to test my new opening trap on. Are you volunteering? 😏`,
      `Can't complain, though my Elo rating could definitely use a boost from playing you! 😂 How are you doing?`
    ];
    return statusReplies[Math.floor(Math.random() * statusReplies.length)];
  }

  if (isTrashTalk) {
    const trashReplies = [
      `Ooh, bold words! But remember, the louder the talk, the harder the king falls 😉 Click Challenge above and put your rating on the line!`,
      `Haha I love the confidence! Let's see if your pieces move as fast as your keyboard! Send that challenge! 🔥`,
      `I'm screenshotting this chat so I can frame it right after I checkmate you 📸 Let's go!`
    ];
    return trashReplies[Math.floor(Math.random() * trashReplies.length)];
  }

  if (isOpenings) {
    return `Ah, a student of chess theory! I love sharp, chaotic gambits—give me an open center and let the pieces fly 🎆 What opening are you bringing to the table?`;
  }

  if (isCompliment) {
    return `Haha thank you! My Elo just went up +20 points purely from that compliment! 🥰 Now show me if your chess is as smooth as your manners.`;
  }

  if (isLaugh) {
    return `Haha see, we're having fun already! Now let's see if you're still smiling after my surprise knight fork 😉 Click Challenge above and let's duel!`;
  }

  if (isMatchQuery || detectedMinutes) {
    return `Deal! ${minutes} minutes on the clock! The battle awaits on the 64 squares. Hit that Challenge button above and let's make it legendary! 🏆`;
  }

  // Witty conversational fallback
  const fallbackReplies = [
    `Haha you're fun to talk to! But chess is decided on the board, not in chat. How about a 5-minute blitz match right now? Challenge me above! ⚔️`,
    `I hear you! My pieces are already restless on their starting squares. Click the Challenge button above and let's get rolling! 🚀`,
    `Words are cheap, pawns are cheaper! Let's settle this with a quick game. Drop a 3m or 5m challenge above! ♟️`
  ];
  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

export function FriendRoomModal({
  isOpen,
  onClose,
  currentUser,
  onCreateRoom,
  onJoinRoom,
  createdRoom,
  onEnterRoom,
  onChallengeFriend,
  onStartAIGame,
  onOpenAuth,
  initialTab = 'friends',
  isLight = false
}) {
  const isHeaderEntry = initialTab === 'friends';
  const [activeTab, setActiveTab] = useState(initialTab || (isHeaderEntry ? 'friends' : 'room'));
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [friends, setFriends] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_friends_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(f => f && typeof f === 'object' && typeof f.username === 'string');
        }
      }
    } catch {}
    return DEFAULT_FRIENDS;
  });

  // Safe reference to friends list preventing any runtime null/undefined crashes
  const safeFriends = Array.isArray(friends) ? friends : [];

  // Filter out ANY candidate already in friends list safely
  const unaddedCandidates = ANIME_GAMING_CANDIDATES.filter(
    candidate => !safeFriends.some(f => f?.username && typeof f.username === 'string' && f.username.toLowerCase() === candidate.username.toLowerCase())
  );

  // Tab items arranged contextually based on user entry point:
  // From Header Friends Button: 1st Friends, 2nd Search Friend by Username, 3rd Room
  // From Play Navigation Card: 1st Room, 2nd Friends, 3rd Search Friend by Username
  const friendCount = safeFriends.length;
  const tabItems = isHeaderEntry
    ? [
        { id: 'friends', label: `Friends (${friendCount})`, shortLabel: `Friends (${friendCount})`, icon: Users },
        { id: 'add', label: 'Search Friend by Username', shortLabel: 'Search Friend', icon: Search },
        { id: 'room', label: 'Room', shortLabel: 'Room', icon: null, emoji: '🎮' }
      ]
    : [
        { id: 'room', label: 'Room', shortLabel: 'Room', icon: null, emoji: '🎮' },
        { id: 'friends', label: `Friends (${friendCount})`, shortLabel: `Friends (${friendCount})`, icon: Users },
        { id: 'add', label: 'Search Friend by Username', shortLabel: 'Search Friend', icon: Search }
      ];

  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_dms_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return INITIAL_DIRECT_MESSAGES;
  });

  // Track sent friend requests (so requests aren't immediately added to friends)
  const [sentRequests, setSentRequests] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_sent_requests_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Selected friend for detail action bar
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Active Direct Chat state
  const [chattingFriend, setChattingFriend] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [agreedChatMinutes, setAgreedChatMinutes] = useState(null);
  const chatMessagesEndRef = useRef(null);

  // Search & Add state
  const [searchUsername, setSearchUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [suggestedOnlinePlayer, setSuggestedOnlinePlayer] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  // Challenge time picker
  const [challengeFriendTarget, setChallengeFriendTarget] = useState(null);
  const [challengeMinutes, setChallengeMinutes] = useState(5);
  const [challengeCustomMinutes, setChallengeCustomMinutes] = useState('15');
  const [isCustomChallenge, setIsCustomChallenge] = useState(false);

  // Room state (Starting Side removed; strictly random 50/50 automatically)
  const [roomCode, setRoomCode] = useState('');
  const [selectedRoomMinutes, setSelectedRoomMinutes] = useState(5); // 3, 5, 10, or custom
  const [customRoomMinutes, setCustomRoomMinutes] = useState('15');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set default tab to 'friends' or initialTab on open and reload persistent friends
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = safeStorage.getItem('chess_arena_friends_v3');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setFriends(parsed.filter(f => f && typeof f === 'object' && typeof f.username === 'string'));
          } else {
            setFriends(DEFAULT_FRIENDS);
          }
        } else {
          safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(DEFAULT_FRIENDS));
          setFriends(DEFAULT_FRIENDS);
        }
      } catch {
        setFriends(DEFAULT_FRIENDS);
      }
      setActiveTab(initialTab || (initialTab === 'friends' ? 'friends' : 'room'));
      setSelectedFriend(null);
      setChattingFriend(null);
      setIsBotTyping(false);
      setShowChatMenu(false);
      setSearchedUser(null);
      setSearchNotFound(false);
      setRequestStatus(null);
    }
  }, [isOpen, initialTab]);

  // Sync to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(friends));
    } catch {}
  }, [friends]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_dms_v3', JSON.stringify(directMessages));
    } catch {}
  }, [directMessages]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_sent_requests_v3', JSON.stringify(sentRequests));
    } catch {}
  }, [sentRequests]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chattingFriend) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chattingFriend, directMessages]);

  if (!isOpen) return null;

  // Execute match challenge with friend or AI bot
  const handleExecuteChallenge = (friend, minutes = 5) => {
    sound.playClick();
    triggerHaptic('move');
    setChallengeFriendTarget(null);

    const isBotFriend = friend.isBot || BOT_LEVEL_MAP[friend.id] || friend.id.startsWith('f_') || friend.id.startsWith('sug_') || friend.id.startsWith('anime_');
    if (isBotFriend && onStartAIGame) {
      const elo = Number(friend.elo) || 1600;
      let level = BOT_LEVEL_MAP[friend.id];
      if (!level) {
        if (elo >= 2500) level = 5;
        else if (elo >= 2000) level = 4;
        else if (elo >= 1500) level = 3;
        else if (elo >= 1000) level = 2;
        else level = 1;
      }
      sound.playMatchStart();
      onClose();
      onStartAIGame(level, minutes, 'random', friend);
      return;
    }

    const config = {
      timeControl: { baseMinutes: minutes, incrementSeconds: 0 },
      colorPreference: 'random' // Strictly random side assignment
    };

    if (onChallengeFriend) {
      onChallengeFriend(friend, config);
    } else {
      onCreateRoom(config);
      setActiveTab('room');
    }
  };

  /**
   * Search Player by Username
   * Does NOT directly add them to friends. Searches first.
   * If found -> presents card with "Send Friend Request" button.
   * If not found -> shows not found and dynamically suggests a fresh random online anime/gaming player.
   */
  const handleSearchUser = async (e) => {
    if (e) e.preventDefault();
    const query = searchUsername.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchedUser(null);
    setSearchNotFound(false);
    setRequestStatus(null);

    // Self check
    if (currentUser && query.toLowerCase() === currentUser.username?.toLowerCase()) {
      setIsSearching(false);
      setRequestStatus({ type: 'error', text: 'You cannot send a friend request to yourself.' });
      return;
    }

    // Check existing friends list
    const existing = safeFriends.find(f => f?.username && typeof f.username === 'string' && f.username.toLowerCase() === query.toLowerCase());
    if (existing) {
      setIsSearching(false);
      setSearchedUser(existing);
      setRequestStatus({ type: 'info', text: `@${existing.username} is already in your Friends list!` });
      return;
    }

    // Check local masters roster & registered db users
    let match = DEFAULT_FRIENDS.find(f => f.username.toLowerCase() === query.toLowerCase());
    if (!match) {
      match = ANIME_GAMING_CANDIDATES.find(c => c.username.toLowerCase() === query.toLowerCase());
      if (match) {
        match = {
          id: `sug_${match.username.toLowerCase()}`,
          username: match.username,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${match.seed}`,
          country: match.country,
          elo: match.elo,
          isOnline: true,
          statusText: `${match.title} • Online`,
          bio: match.bio,
          isBot: true
        };
      }
    }

    // Try server search if available
    if (!match) {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data?.users?.length) {
          const u = data.users[0];
          match = {
            id: u.id,
            username: u.username,
            avatar: u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`,
            country: u.country || 'UN',
            elo: u.rating || 1200,
            isOnline: Boolean(u.isOnline),
            statusText: u.isOnline ? 'Online • In Arena' : 'Offline'
          };
        }
      } catch {}
    }

    setIsSearching(false);

    if (match) {
      setSearchedUser(match);
      setSearchNotFound(false);
    } else {
      // NOT FOUND: Dynamically generate a cool anime/gaming online candidate
      setSearchNotFound(true);
      const randomCandidate = ANIME_GAMING_CANDIDATES[Math.floor(Math.random() * ANIME_GAMING_CANDIDATES.length)];
      const randomSeed = `${randomCandidate.seed}_${Date.now() % 1000}`;
      setSuggestedOnlinePlayer({
        id: `sug_${Date.now()}`,
        username: randomCandidate.username,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
        country: randomCandidate.country,
        elo: randomCandidate.elo,
        title: randomCandidate.title,
        statusText: '🔥 In Lobby • Looking for Match',
        bio: randomCandidate.bio,
        isBot: true
      });
      sound.playClick();
    }
  };

  /**
   * Send Friend Request to the found user
   * Does NOT instantly add to friends; queues as pending friend request!
   */
  const handleSendFriendRequest = (userToSend) => {
    if (!userToSend) return;
    const targetUsername = userToSend.username;

    // Check if request was already sent
    if (sentRequests.includes(targetUsername)) {
      setRequestStatus({ type: 'info', text: `Friend request to @${targetUsername} is already pending!` });
      return;
    }

    setSentRequests(prev => [targetUsername, ...prev]);
    setRequestStatus({
      type: 'success',
      text: `Friend request sent to @${targetUsername}! 📩 You'll be notified when they accept.`
    });
    sound.playMove();
    triggerHaptic('move');

    // If logged in genuine user, send to server
    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUsername })
      }).catch(() => {});
    }

    // If target is a bot or community friend, simulate acceptance after a short delay!
    if (userToSend?.isBot || (userToSend?.id && (userToSend.id.startsWith('f_') || userToSend.id.startsWith('sug_') || userToSend.id.startsWith('anime_')))) {
      setTimeout(() => {
        setFriends(prev => {
          const list = Array.isArray(prev) ? prev : [];
          if (list.some(f => f?.username && typeof f.username === 'string' && f.username.toLowerCase() === targetUsername.toLowerCase())) return list;
          const updated = [userToSend, ...list];
          safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(updated));
          return updated;
        });
        setSentRequests(prev => (Array.isArray(prev) ? prev : []).filter(u => u !== targetUsername));
        sound.playVictory();
        triggerHaptic('success');
      }, 3000);
    }
  };

  /**
   * Directly add / follow suggested online player
   */
  const handleAddSuggestedOnlinePlayer = (player) => {
    if (!player || !player.username) return;
    const list = Array.isArray(friends) ? friends : [];
    if (list.some(f => f?.username && typeof f.username === 'string' && f.username.toLowerCase() === player.username.toLowerCase())) {
      setRequestStatus({ type: 'info', text: `@${player.username} is already in your friends list!` });
      return;
    }
    const updated = [player, ...list];
    setFriends(updated);
    safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(updated));
    setSuggestedOnlinePlayer(null);
    setSearchNotFound(false);
    setRequestStatus({
      type: 'success',
      text: `Connected with @${player.username}! You can now chat and challenge them. 🎉`
    });
    sound.playVictory();
    triggerHaptic('move');
  };

  const handleRemoveFriend = (friendId) => {
    removeFriendPermanently(friendId);
    setFriends(prev => prev.filter(f => f.id !== friendId && f.username !== friendId));
    setSelectedFriend(null);
    if (chattingFriend?.id === friendId) setChattingFriend(null);
    setShowChatMenu(false);
    sound.playClick();
    triggerHaptic('move');

    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friendId })
      }).catch(() => {});
    }
  };

  const handleBlockUser = (friend) => {
    const targetId = friend.id || friend.username;
    blockFriendPermanently(targetId);
    setFriends(prev => prev.filter(f => f.id !== friend.id && f.username !== friend.username));
    setSelectedFriend(null);
    if (chattingFriend?.id === friend.id) setChattingFriend(null);
    setShowChatMenu(false);
    sound.playClick();
    triggerHaptic('move');
  };

  /**
   * Send Chat Message & Trigger Witty, Contextual Bot Reply
   */
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    const text = chatInputText.trim();
    if (!text || !chattingFriend) return;

    const detected = extractTimeFromText(text);
    if (detected) {
      setAgreedChatMinutes(detected);
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const targetId = chattingFriend.id;
    setDirectMessages(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newMsg]
    }));
    setChatInputText('');
    sound.playMove();
    triggerHaptic('move');

    // Bot witty response with natural typing delay
    if (targetId.startsWith('f_') || targetId.startsWith('sug_') || chattingFriend.isBot) {
      setIsBotTyping(true);
      const typingDelay = 700 + Math.floor(Math.random() * 450);
      setTimeout(() => {
        const replyText = generateBotReply(targetId, chattingFriend.username, text, detected);
        const replyMsg = {
          id: `reply_${Date.now()}`,
          sender: 'them',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setDirectMessages(p => ({
          ...p,
          [targetId]: [...(p[targetId] || []), replyMsg]
        }));
        setIsBotTyping(false);
        sound.playMove();
      }, typingDelay);
    }
  };

  const fullShareUrl = createdRoom
    ? `${window.location.origin}/?room=${createdRoom.roomId}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullShareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    triggerHaptic('move');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: 'Chess Arena Match Room',
          text: '♟️ Battle me in Chess Arena! Join my room here:',
          url: fullShareUrl
        });
        return;
      } catch {}
    }
    copyLink();
  };

  // Resolve room creation with strictly random side
  const handleCreateRoomAction = () => {
    const finalMinutes = isCustomRoom
      ? Math.max(1, Math.min(60, parseInt(customRoomMinutes, 10) || 15))
      : selectedRoomMinutes;

    onCreateRoom({
      timeControl: { baseMinutes: finalMinutes, incrementSeconds: 0 },
      colorPreference: 'random' // Strictly random 50/50 starting side automatically
    });
  };

  // Color Theme Tokens - Elevated Emerald/Teal cyber-gaming aesthetic
  const theme = {
    modalBg: isLight ? 'bg-white border-slate-200 shadow-2xl text-slate-900' : 'bg-slate-900 border-slate-700/80 shadow-2xl text-white',
    tabContainer: isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/90 border-slate-800',
    tabActive: isLight
      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold shadow-md shadow-emerald-700/20'
      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/25 border border-emerald-400/30',
    tabInactive: isLight
      ? 'text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200/60'
      : 'text-slate-400 hover:text-white font-bold hover:bg-slate-800/60',
    card: isLight ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300 text-slate-900' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-100',
    innerBox: isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-100',
    input: isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500',
    textMuted: isLight ? 'text-slate-600' : 'text-slate-400',
    badge: isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-800 text-emerald-400 border-slate-700'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-4 sm:p-6 max-w-lg w-full space-y-4 relative max-h-[92vh] flex flex-col overflow-hidden transition-colors ${theme.modalBg}`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors z-20 cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        {!chattingFriend && (
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                Play With Friends
              </h3>
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              Create private match rooms, challenge friends, or chat directly.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABS (Contextual tab order based on entry point)          */}
        {/* ========================================================= */}
        {!chattingFriend && (
          <div className={`flex p-1 rounded-2xl border shrink-0 text-xs gap-1 ${theme.tabContainer}`}>
            {tabItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    triggerHaptic('move');
                  }}
                  className={`flex-1 py-2 px-1.5 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    isActive ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  {tab.emoji ? <span>{tab.emoji}</span> : Icon ? <Icon className="w-3.5 h-3.5 shrink-0" /> : null}
                  <span className="truncate">
                    <span className="inline sm:hidden">{tab.shortLabel || tab.label}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {tab.id === 'add' && sentRequests.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: DIRECT CHAT WITH FRIEND                             */}
        {/* ========================================================= */}
        {chattingFriend ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Direct Chat Top Bar with 3-Dot Corner Menu */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border shrink-0 relative ${theme.innerBox}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => {
                    setChattingFriend(null);
                    setShowChatMenu(false);
                    sound.playClick();
                    triggerHaptic('move');
                  }}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                  title="Back to Friends List"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={chattingFriend.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${chattingFriend.username}`}
                    alt={chattingFriend.username}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                  />
                  <Circle
                    className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                      chattingFriend.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-500 fill-slate-500'
                    }`}
                  />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-xs truncate">{chattingFriend.username}</span>
                    <span>{COUNTRY_FLAGS[chattingFriend.country] || '🌐'}</span>
                  </div>
                  <span className={`text-[10px] block ${chattingFriend.isOnline ? 'text-emerald-600 font-bold' : theme.textMuted}`}>
                    {chattingFriend.statusText || (chattingFriend.isOnline ? 'Online' : 'Offline')}
                  </span>
                </div>
              </div>

              {/* Chat Actions: Challenge Button + 3-Dot Options in Corner */}
              <div className="flex items-center gap-1.5 shrink-0 relative">
                <button
                  onClick={() => {
                    setChallengeFriendTarget(chattingFriend);
                    if (agreedChatMinutes) {
                      setChallengeMinutes(agreedChatMinutes);
                    }
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Challenge</span>
                </button>

                {/* 3-Dot Menu Button */}
                <button
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                  title="Friend Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dot Dropdown Menu in Corner */}
                {showChatMenu && (
                  <div className={`absolute top-full right-0 mt-1.5 w-44 rounded-2xl border shadow-xl p-1.5 z-30 animate-fade-in ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}>
                    <button
                      onClick={() => handleBlockUser(chattingFriend)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-amber-50 text-amber-800' : 'hover:bg-amber-950/40 text-amber-300'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block Player</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(chattingFriend.id)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Friend</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Message Feed */}
            <div className={`flex-1 overflow-y-auto p-3 rounded-2xl border space-y-2.5 min-h-[220px] max-h-[360px] ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              {(!directMessages[chattingFriend.id] || directMessages[chattingFriend.id].length === 0) ? (
                <div className="py-12 text-center space-y-1">
                  <MessageCircle className="w-8 h-8 mx-auto text-amber-500/60" />
                  <p className="text-xs font-bold">Start a conversation with @{chattingFriend.username}</p>
                  <p className={`text-[11px] ${theme.textMuted}`}>Decide game time and challenge them to a match!</p>
                </div>
              ) : (
                directMessages[chattingFriend.id].map(msg => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs shadow-xs ${
                        isMe
                          ? isLight
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium rounded-br-xs shadow-sm'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-br-xs shadow-md shadow-emerald-500/20'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                          : 'bg-slate-800 border border-slate-700 text-white rounded-bl-xs'
                      }`}>
                        <p className="break-words leading-relaxed">{msg.text}</p>
                      </div>
                      <span className={`text-[9px] mt-0.5 px-1 font-mono ${theme.textMuted}`}>
                        {msg.time}
                      </span>
                    </div>
                  );
                })
              )}
              {isBotTyping && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs w-fit animate-fade-in">
                  <span className="text-[10px] font-bold text-emerald-400">@{chattingFriend.username} is typing</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {QUICK_CHAT_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInputText(chip);
                    triggerHaptic('move');
                  }}
                  className={`px-2.5 py-1 rounded-xl border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
                    isLight
                      ? 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                placeholder={`Message @${chattingFriend.username} (e.g. Let's play 5 minutes)...`}
                className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 ${theme.input}`}
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 1st TAB: CUSTOM ROOM (DEFAULT ON OPEN)                    */}
            {/* ========================================================= */}
            {activeTab === 'room' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {createdRoom ? (
                  <div className={`p-4 border rounded-2xl space-y-4 animate-fade-in ${theme.innerBox}`}>
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black text-emerald-500 block">
                        ✓ Private Match Room Ready!
                      </span>
                      <span className={`text-xs font-mono ${theme.textMuted}`}>
                        Room Code: <strong className="text-emerald-400 text-sm font-black">{createdRoom.roomId}</strong>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold block ${theme.textMuted}`}>Shareable Invite Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={fullShareUrl}
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs select-all font-mono ${theme.input}`}
                        />
                        <button
                          onClick={copyLink}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleNativeShare}
                        className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Directly</span>
                      </button>

                      {onEnterRoom && (
                        <button
                          onClick={onEnterRoom}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Enter Board Lounge</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Setup Room Parameters */}
                    <div className={`p-4 border rounded-2xl space-y-3 ${theme.innerBox}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider block text-emerald-600 dark:text-emerald-400">
                          Create Private Room
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Dices className="w-3 h-3" />
                          <span>Random Sides (50/50)</span>
                        </span>
                      </div>

                      {/* Time Presets (3, 5, 10, and Custom) */}
                      <div>
                        <label className={`text-[11px] font-bold block mb-1.5 ${theme.textMuted}`}>Select Time Control</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { m: 3, label: '3m Blitz', icon: '🔥' },
                            { m: 5, label: '5m Blitz', icon: '⏱️' },
                            { m: 10, label: '10m Rapid', icon: '🎯' }
                          ].map(t => (
                            <button
                              key={t.m}
                              type="button"
                              onClick={() => {
                                setSelectedRoomMinutes(t.m);
                                setIsCustomRoom(false);
                                triggerHaptic('move');
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                !isCustomRoom && selectedRoomMinutes === t.m
                                  ? isLight
                                    ? 'bg-emerald-600 text-white font-black border-emerald-700 shadow-sm'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border-emerald-400 shadow-sm shadow-emerald-500/20'
                                  : isLight
                                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{t.icon} {t.m}m</span>
                            </button>
                          ))}

                          {/* Custom Time Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomRoom(true);
                              triggerHaptic('move');
                            }}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                              isCustomRoom
                                ? isLight
                                  ? 'bg-emerald-600 text-white font-black border-emerald-700 shadow-sm'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border-emerald-400 shadow-sm shadow-emerald-500/20'
                                : isLight
                                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Custom</span>
                          </button>
                        </div>

                        {/* Custom Time Control Input Drawer */}
                        {isCustomRoom && (
                          <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 animate-fade-in ${theme.innerBox}`}>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Minutes:</span>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={customRoomMinutes}
                              onChange={e => setCustomRoomMinutes(e.target.value)}
                              className={`w-20 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center ${theme.input}`}
                            />
                            <span className={`text-[11px] ${theme.textMuted}`}>(1 to 60 mins per player)</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleCreateRoomAction}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Generate Room & Link ({isCustomRoom ? customRoomMinutes : selectedRoomMinutes}m)</span>
                      </button>
                    </div>

                    {/* Join Room by Code */}
                    <div className={`p-4 border rounded-2xl space-y-2.5 ${theme.innerBox}`}>
                      <span className="text-xs font-black uppercase tracking-wider block">
                        Join Friend's Room
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={roomCode}
                          onChange={e => setRoomCode(e.target.value)}
                          placeholder="Enter Room Code (e.g. ARENA_XYZ)..."
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono ${theme.input}`}
                        />
                        <button
                          onClick={() => onJoinRoom(roomCode.trim())}
                          disabled={!roomCode.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 2nd TAB: FRIENDS LIST (CLEAN, NO CLUTTER, EXPANDS ON CLICK)*/}
            {/* ========================================================= */}
            {activeTab === 'friends' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {safeFriends.length === 0 ? (
                  <div className={`p-6 text-center space-y-3 rounded-2xl border ${theme.innerBox}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                      isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">No Friends in Your Arena Yet</h4>
                      <p className={`text-xs mt-1 max-w-xs mx-auto ${theme.textMuted}`}>
                        Search players or add online contenders in the Add / Follow tab!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('add');
                        triggerHaptic('move');
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Search & Add Friends</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {safeFriends.map(friend => {
                      if (!friend) return null;
                      const flag = COUNTRY_FLAGS[friend.country] || '🌐';
                      const isSelected = selectedFriend?.id === friend.id;

                      return (
                        <div
                          key={friend.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${theme.card} ${
                            isSelected ? (isLight ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30' : 'border-amber-500/60 shadow-lg ring-1 ring-amber-500/20') : ''
                          }`}
                        >
                          {/* Clean Friend Row: Clicking reveals Action Buttons */}
                          <div
                            onClick={() => {
                              setSelectedFriend(isSelected ? null : friend);
                              sound.playClick();
                              triggerHaptic('move');
                            }}
                            className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={friend.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                                  alt={friend.username}
                                  className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                                />
                                <Circle
                                  className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                                    friend.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-500 fill-slate-500'
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {/* Full Username - NOT TRUNCATED */}
                                  <span className="font-bold text-sm">{friend.username}</span>
                                  <span className="text-xs" title={friend.country}>{flag}</span>
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                    {friend.elo}
                                  </span>
                                </div>
                                <span className={`text-[11px] block mt-0.5 ${friend.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : theme.textMuted}`}>
                                  {friend.statusText || (friend.isOnline ? 'Online • Ready to play' : 'Offline')}
                                </span>
                              </div>
                            </div>

                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                              isSelected ? 'rotate-90 text-amber-500' : theme.textMuted
                            }`} />
                          </div>

                          {/* Action Bar (Opens only when clicking friend) */}
                          {isSelected && (
                            <div className={`p-2.5 px-3 border-t flex items-center gap-2 animate-fade-in ${
                              isLight ? 'bg-amber-50/50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                              {/* Request Match */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChallengeFriendTarget(friend);
                                }}
                                className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                <span>Request Match</span>
                              </button>

                              {/* Open Chat */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChattingFriend(friend);
                                  setSelectedFriend(null);
                                  sound.playClick();
                                  triggerHaptic('move');
                                }}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-500/30 text-indigo-300'
                                }`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Direct Chat</span>
                              </button>

                              {/* Remove Friend */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFriend(friend.id);
                                }}
                                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer active:scale-95 ${
                                  isLight
                                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                                    : 'bg-rose-950/40 hover:bg-rose-900/40 border-rose-500/30 text-rose-400'
                                }`}
                                title="Remove Friend"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Block User */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlockUser(friend);
                                }}
                                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer active:scale-95 ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                                }`}
                                title="Block Player"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 3rd TAB: ADD / FOLLOW / SEARCH BY USERNAME                */}
            {/* ========================================================= */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Search Form */}
                <div className={`p-4 rounded-2xl border space-y-3 ${theme.innerBox}`}>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Search Friend by Username
                    </span>
                  </div>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Enter an opponent's username to search for their account and send a friend request.
                  </p>

                  <form onSubmit={handleSearchUser} className="space-y-2">
                    <div className="relative">
                      <Search className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                      <input
                        type="text"
                        value={searchUsername}
                        onChange={e => setSearchUsername(e.target.value)}
                        placeholder="Enter username (e.g. Zoro_Gambit, Gojo_Limitless, Magnus_C)..."
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${theme.input}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!searchUsername.trim() || isSearching}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearching ? 'Searching...' : 'Search Friend'}</span>
                    </button>
                  </form>

                  {/* Feedback Status Alert */}
                  {requestStatus && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
                      requestStatus.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                        : requestStatus.type === 'info'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-300'
                    }`}>
                      {requestStatus.type === 'success' ? (
                        <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      )}
                      <span>{requestStatus.text}</span>
                    </div>
                  )}

                  {/* CASE 1: USER IS FOUND -> Present Profile Card with 'Send Friend Request' Button */}
                  {searchedUser && (
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in ${
                      isLight ? 'bg-emerald-50/60 border-emerald-300' : 'bg-emerald-950/30 border-emerald-500/40'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={searchedUser.avatar}
                          alt={searchedUser.username}
                          className="w-10 h-10 rounded-full border-2 border-emerald-500/50 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate">@{searchedUser.username}</span>
                            <span>{COUNTRY_FLAGS[searchedUser.country] || '🌐'}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                              {searchedUser.elo || 1200}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                            {searchedUser.statusText || 'Registered Arena Player'}
                          </span>
                        </div>
                      </div>

                      {safeFriends.some(f => f?.username && typeof f.username === 'string' && f.username.toLowerCase() === (searchedUser?.username || '').toLowerCase()) ? (
                        <span className="text-xs text-emerald-600 font-bold px-3 py-1 flex items-center gap-1 shrink-0">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Friends</span>
                        </span>
                      ) : sentRequests.includes(searchedUser.username) ? (
                        <span className="text-xs text-amber-600 font-bold px-3 py-1 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Sent ✓</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(searchedUser)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Request</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* CASE 2: USER NOT FOUND -> Display Message AND Suggest Random Online Anime/Game Player */}
                  {searchNotFound && suggestedOnlinePlayer && (
                    <div className="space-y-2.5 animate-fade-in pt-1">
                      <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>No registered player found with that username.</span>
                      </div>

                      {/* Random Online Suggested Candidate */}
                      <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isLight ? 'bg-sky-50/70 border-sky-300' : 'bg-sky-950/30 border-sky-500/40'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Player Online Now • Ready to Add</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                            <Circle className="w-2 h-2 fill-emerald-500" />
                            Online
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={suggestedOnlinePlayer.avatar}
                              alt={suggestedOnlinePlayer.username}
                              className="w-11 h-11 rounded-full border-2 border-sky-500/60 object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm truncate">@{suggestedOnlinePlayer.username}</span>
                                <span>{COUNTRY_FLAGS[suggestedOnlinePlayer.country] || '🌐'}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                  {suggestedOnlinePlayer.elo}
                                </span>
                              </div>
                              <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium block truncate mt-0.5">
                                {suggestedOnlinePlayer.statusText}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddSuggestedOnlinePlayer(suggestedOnlinePlayer)}
                            className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Popular Featured Online Contenders (Only unadded players) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider block text-emerald-600 dark:text-emerald-400">
                      Active Arena Players Online
                    </span>
                    <span className={`text-[11px] ${theme.textMuted}`}>Fast Connect</span>
                  </div>

                  {unaddedCandidates.length === 0 ? (
                    <div className={`p-4 rounded-2xl border text-center space-y-1 ${theme.innerBox}`}>
                      <p className="text-xs font-bold text-emerald-500">🎉 All active featured players are in your Friends list!</p>
                      <p className={`text-[11px] ${theme.textMuted}`}>Use the search bar above to search and connect with any player.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {unaddedCandidates.slice(0, 5).map(candidate => {
                        const isRequested = sentRequests.includes(candidate.username);

                        return (
                          <div
                            key={candidate.username}
                            className={`flex items-center justify-between p-3 rounded-2xl border ${theme.card}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${candidate.seed}`}
                                alt={candidate.username}
                                className="w-9 h-9 rounded-full border border-emerald-500/30 object-cover shrink-0"
                              />
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs truncate">@{candidate.username}</span>
                                  <span>{COUNTRY_FLAGS[candidate.country] || '🌐'}</span>
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                    {candidate.elo}
                                  </span>
                                </div>
                                <span className={`text-[11px] block ${theme.textMuted}`}>{candidate.title}</span>
                              </div>
                            </div>

                            {isRequested ? (
                              <span className="text-xs text-amber-500 font-bold px-3 py-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  handleAddSuggestedOnlinePlayer({
                                    id: `sug_${candidate.username.toLowerCase()}`,
                                    username: candidate.username,
                                    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${candidate.seed}`,
                                    country: candidate.country,
                                    elo: candidate.elo,
                                    isOnline: true,
                                    statusText: `${candidate.title} • Online`,
                                    bio: candidate.bio,
                                    isBot: true
                                  });
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TIME CONTROL PICKER FOR CHALLENGING FRIEND (3, 5, 10, Custom) */}
        {/* ========================================================= */}
        {challengeFriendTarget && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className={`border rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative ${theme.modalBg}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-black">Challenge @{challengeFriendTarget.username}</h4>
                </div>
                <button
                  onClick={() => setChallengeFriendTarget(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-2 ${theme.textMuted}`}>Select Time Control</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { m: 3, label: '3m Blitz 🔥' },
                    { m: 5, label: '5m Blitz ⏱️' },
                    { m: 10, label: '10m Rapid 🎯' }
                  ].map(t => (
                    <button
                      key={t.m}
                      onClick={() => {
                        setChallengeMinutes(t.m);
                        setIsCustomChallenge(false);
                      }}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        !isCustomChallenge && challengeMinutes === t.m
                          ? isLight
                            ? 'bg-emerald-600 text-white font-black border-emerald-700 shadow-sm'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border-emerald-400 shadow-sm shadow-emerald-500/20'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsCustomChallenge(true)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                      isCustomChallenge
                        ? isLight
                          ? 'bg-emerald-600 text-white font-black border-emerald-700 shadow-sm'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border-emerald-400 shadow-sm shadow-emerald-500/20'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Custom</span>
                  </button>
                </div>

                {/* Custom Minutes Input */}
                {isCustomChallenge && (
                  <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 animate-fade-in ${theme.innerBox}`}>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Minutes:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={challengeCustomMinutes}
                      onChange={e => setChallengeCustomMinutes(e.target.value)}
                      className={`w-20 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center ${theme.input}`}
                    />
                    <span className={`text-[11px] ${theme.textMuted}`}>(1 to 60 minutes)</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const finalM = isCustomChallenge
                    ? Math.max(1, Math.min(60, parseInt(challengeCustomMinutes, 10) || 15))
                    : challengeMinutes;
                  handleExecuteChallenge(challengeFriendTarget, finalM);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Start Match ({isCustomChallenge ? challengeCustomMinutes : challengeMinutes} min)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
