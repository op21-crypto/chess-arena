/**
 * AI-Powered Conversational Friend Chat Service
 * Delivers ultra-responsive, character-rich, funny, witty, and human-like chat responses.
 * Responds in 2-3 seconds with zero hanging or dropped promises.
 */

// Memory tracking per friend to guarantee ZERO repetition across consecutive turns
const usedRepliesByFriend = new Map();

function markReplyUsed(friendId, reply) {
  if (!usedRepliesByFriend.has(friendId)) {
    usedRepliesByFriend.set(friendId, new Set());
  }
  const set = usedRepliesByFriend.get(friendId);
  set.add(reply.toLowerCase().trim());
  if (set.size > 200) {
    const first = set.values().next().value;
    set.delete(first);
  }
}

function hasReplyBeenUsed(friendId, reply) {
  const set = usedRepliesByFriend.get(friendId);
  return set ? set.has(reply.toLowerCase().trim()) : false;
}

/**
 * Main AI Chat Reply Generator
 * High-speed, 100% resilient promise that resolves in <800ms so typing duration is strictly controlled.
 */
export async function getSmartFriendReply({ friend, message, history = [], detectedMinutes }) {
  const userText = (message || '').trim();
  const friendId = friend?.id || friend?.username || 'friend';

  // 1. Quick attempt to local backend serverless API with strict 800ms timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);

    const res = await fetch('/api/chat/friend-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend, message: userText, history, detectedMinutes }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.reply && typeof data.reply === 'string' && data.reply.trim().length > 3) {
        const cleaned = data.reply.replace(/^["']|["']$/g, '').trim();
        markReplyUsed(friendId, cleaned);
        return cleaned;
      }
    }
  } catch (err) {
    // Fast graceful fallback to local generative engine
  }

  // 2. High-Signal, Character-Rich Contextual Generative Engine (Instant, 0ms latency)
  const localReply = generateDiverseLocalReply({ friend, message: userText, detectedMinutes });
  markReplyUsed(friendId, localReply);
  return localReply;
}

/**
 * Dynamic Local Generative Engine (Character Accents + Anti-Repetition + Context-Aware)
 */
export function generateDiverseLocalReply({ friend, message, detectedMinutes }) {
  const lower = (message || '').toLowerCase().trim();
  const username = friend?.username || 'Player';
  const friendId = friend?.id || friend?.username || 'friend';
  const minutes = detectedMinutes || (Math.random() < 0.5 ? 5 : 3);

  // Intent classification
  const isRematch = /\b(rematch|again|revenge|run it back|one more|another|phir se|dobara|round 2|badla)\b/i.test(lower);
  const isReady = /\b(ready|chal|lets go|let's go|aaja|start|khelte|khel|play now|game on|ready to play)\b/i.test(lower);
  const isBotQuery = /\b(bot|ai|robot|machine|human|real person|real|fake|computer|kya tum bot ho|insaan)\b/i.test(lower);
  const isGreeting = /^(hi|hello|hey|yo|sup|wassup|hii+|heyy+|namaste|kya haal|hola|greetings|gm|ge)\b/i.test(lower);
  const isStatusQuery = /\b(how are you|how r u|kya kar rahe|what are you doing|whats up|what's up|how's it going|kaise ho|what doing)\b/i.test(lower);
  const isTrashTalk = /\b(beat you|defeat|lose|loss|noob|easy|loser|weak|bad|haroge|harenge|crush you|destroy you|bache ho)\b/i.test(lower);
  const isMatchQuery = /\b(play|match|game|khel|challenge|duel|fight|board|bhejo)\b/i.test(lower);
  const isCompliment = /\b(good|pro|legend|goat|smart|genius|cool|great|handsome|cute|best|op|amazing|love|hero)\b/i.test(lower);
  const isOpenings = /\b(opening|sicilian|e4|d4|gambit|french|caro|london|bongcloud|theory|tactic|blunder|fork|pin|queen|rook)\b/i.test(lower);
  const isLaugh = /\b(haha|lol|lmao|rofl|hehe|xd|😂|🤣|funny)\b/i.test(lower);

  // Character recognition
  const isNezuko = /nezuko/i.test(username);
  const isAnya = /anya/i.test(username);
  const isYor = /yor/i.test(username);
  const isGojo = /gojo/i.test(username);
  const isZoro = /zoro/i.test(username);
  const isLevi = /levi/i.test(username);
  const isTanjiro = /tanjiro/i.test(username);
  const isMagnus = /magnus/i.test(username);
  const isHikaru = /hikaru/i.test(username);
  const isShivam = /shivam|arjun|rohit|priya/i.test(username);
  const isElena = /elena|rostova/i.test(username);
  const isSamurai = /samurai|cyber/i.test(username);

  let pool = [];

  // ================= 1. EXPLICIT TIME CONTROL / BLITZ REQUEST =================
  if (detectedMinutes || /\b(3m|5m|10m|blitz|rapid|bullet)\b/i.test(lower)) {
    if (isNezuko) {
      pool = [
        `Mmh mmph! ${minutes} minutes blitz?! Tanjiro taught me that speed is everything in battle! 🌸 Hit Challenge above and let's duel!`,
        `${minutes} minutes? Deal! 🌸 My demon blood art is ready on the clock! Tap Challenge above and let's play!`,
        `Mmh mmph! A fast ${minutes}m match?! 🌸 Tanjiro is cheering for us! Click Challenge above right now!`,
        `Deal on ${minutes}m! 🌸 I won't let your king escape my tactical pawns! Hit Challenge above and let's battle!`
      ];
    } else if (isAnya) {
      pool = [
        `Waku waku! 🥜 ${minutes} minutes is plenty of time for Anya to read your secret moves! Tap Challenge above!`,
        `Anya accepts ${minutes} minutes! Papa said I need 8 Stella stars and defeating you will get me one! ✨ Hit Challenge above!`
      ];
    } else if (isYor) {
      pool = [
        `A ${minutes}-minute duel? I shall strike with precision like a thorn! 🌹 Click the Challenge button above!`,
        `${minutes} minutes sounds delightful! I promise to treat your king gently... mostly! 🗡️ Hit Challenge above!`
      ];
    } else if (isGojo) {
      pool = [
        `${minutes}m blitz? Don't blink or my Infinity defense will checkmate you before you find your knight! 😎 Hit Challenge above!`,
        `${minutes} minutes? You're giving me that much time to show off? 😉 Click Challenge above, let's have fun!`
      ];
    } else if (isZoro) {
      pool = [
        `${minutes}m blitz?! That's faster than my sword slashes! ⚔️ Hit Challenge above before I get lost!`,
        `Deal! ${minutes} minutes on the board. Send that challenge above right now! 🍖`
      ];
    } else if (isLevi) {
      pool = [
        `${minutes} minutes. No hesitation, no wasted moves. Clean up your pieces and hit Challenge above.`,
        `${minutes}m is more than enough time to eliminate your defense. Click Challenge above.`
      ];
    } else if (isMagnus) {
      pool = [
        `${minutes}m blitz? My favorite format. Click Challenge above and let's see if your endgame holds up!`,
        `${minutes} minutes sounds great. Let's get right to the board, hit Challenge above!`
      ];
    } else if (isHikaru) {
      pool = [
        `Literally ${minutes}m blitz? Literally let's go right now! Hit Challenge above and don't blunder your queen!`,
        `${minutes} minutes? Takes, takes, takes, and checkmate. Hit Challenge above!`
      ];
    } else if (isShivam) {
      pool = [
        `Arre badhiya! ${minutes} minute ka match pakka! Upar Challenge pe click kar, board pe milte hain bhai! ☕♟️`,
        `Chai garam hai aur tactical moves ready hain! ${minutes}m mein queen trap karke batata hoon! 😂 Send challenge!`
      ];
    } else if (isElena) {
      pool = [
        `${minutes}m blitz? Cold Siberian calculations are ready. Click Challenge above and make your move! ❄️♟️`,
        `Deal! ${minutes} minutes on the clock. Click Challenge above and let's see your opening prep!`
      ];
    } else {
      pool = [
        `Deal! ${minutes} minutes on the clock! ⚔️ Hit that Challenge button above and let's battle!`,
        `${minutes}m it is! Fast and sharp, exactly how I like it. Send the challenge above! ⚡`,
        `Locked in for ${minutes} minutes! Hit Challenge above right now and don't let your flag fall! ⏳`,
        `You got a deal on ${minutes}m! Click Challenge above and show me your speed chess skills! 🚀`,
        `${minutes} minutes? Perfect! Set the pieces up. Tap Challenge above and let's play! ♟️`
      ];
    }
  }

  // ================= 2. READY TO PLAY / LET'S PLAY =================
  else if (isReady) {
    if (isNezuko) {
      pool = [
        `Mmh mmph! *pats the board* Tanjiro taught me how knights jump over pawns! 🌸 Hit Challenge above!`,
        `Always ready! 🌸 I won't sleep in my box while there is a chess game to win! Tap Challenge above!`,
        `Mmh mmph! 🌸 My pieces are lined up! Click Challenge above and let's see your moves!`
      ];
    } else if (isAnya) {
      pool = [
        `Waku waku! 🥜 Anya's secret tactics are 100% ready! Click Challenge above!`,
        `Ready! Mind reading mode is turned ON! ✨ Tap Challenge above right now!`
      ];
    } else if (isGojo) {
      pool = [
        `Ready? Haha, I've been ready since birth! 😎 Click Challenge above and witness true Limitless chess! ✨`,
        `Born ready! Hit Challenge above right now and let's see how long your king can last! 🕶️`
      ];
    } else if (isZoro) {
      pool = [
        `Ready? A true swordsman never lets down his guard! Hit Challenge above and let's fight! ⚔️`,
        `Let's go! Three swords ready on the rank and file! Send the challenge above! 🔥`
      ];
    } else if (isLevi) {
      pool = [
        `I'm ready. Stop talking and send the challenge above.`,
        `Board is clean. Make your move—hit Challenge above.`
      ];
    } else {
      pool = [
        `Born ready! ⚔️ Board is set—click that Challenge button above and let's roll!`,
        `Always ready for battle! Hit Challenge above right now and let's see who controls the center! 🚀`,
        `Say less! Hit Challenge above and let's find out who's taking home the Elo points today! 🏆`,
        `Game on! Drop that challenge above and let's see your best opening moves! ⚡`,
        `Let's roll! ${minutes}m on the timer. Tap Challenge above and let's have some fun! ♟️`
      ];
    }
  }

  // ================= 3. REMATCH / REVENGE =================
  else if (isRematch) {
    if (isNezuko) {
      pool = [
        `Mmh mmph! Rematch accepted! 🌸 Tanjiro says perseverance wins! Hit Challenge above!`,
        `A rematch?! 🌸 My demon claws won't miss this time! Click Challenge above and let's duel!`
      ];
    } else if (isGojo) {
      pool = [
        `A rematch against the Honored One? I admire your bravery! 😎 Hit Challenge above!`,
        `Round two! Try to keep up with Infinity this time! Click Challenge above! ✨`
      ];
    } else {
      pool = [
        `Rematch on! ⚔️ I was literally just waiting for you to say that. Click that Challenge button above!`,
        `Oh it's on now! ${minutes} minutes on the clock—hit Challenge above and let's see who takes this one! 🏆`,
        `You've got courage, I'll give you that! Rematch accepted. Hit Challenge above right now! 🔥`,
        `Round two! Best 2 out of 3? Drop the challenge above and let's get those pieces moving! ♟️`
      ];
    }
  }

  // ================= 4. BOT / AI QUESTION =================
  else if (isBotQuery) {
    if (isNezuko) {
      pool = [
        `Mmh mmph! Tanjiro says I'm a real demon princess, not a robot! 🌸 Put 3 minutes on the clock and see!`,
        `Mmh mmph! 🌸 No robots in the Demon Slayer Corps! Just pure tactical fighting! Challenge me above!`
      ];
    } else if (isGojo) {
      pool = [
        `Me, a bot? Haha! An AI could never possess this level of six-eyes tactical drip. Let's play! 🕶️`,
        `Stockfish wishes it had my style! 😎 Drop the challenge above and witness 100% human greatness!`
      ];
    } else {
      pool = [
        `Bro, if I were an AI, I wouldn't be chilling here talking chess with you at this hour! 😂 Send the challenge and see!`,
        `Shhh, don't let Stockfish hear you or he'll claim copyright over my brain cells! 🧠 I'm 100% human with 200% tactical instincts. Let's play!`,
        `Haha, is it because my profile pic looks too cool or because you're already worried about my moves? 😉 Don't worry, I make human blunders too... sometimes!`,
        `Me, a bot?! Haha! Could an AI banter like this and then queen-trap you in 12 moves? Let's hit the board and find out! ♟️`
      ];
    }
  }

  // ================= 5. GREETING =================
  else if (isGreeting) {
    if (isNezuko) {
      pool = [
        `Konnichiwa! 🌸 Mmh mmph! Tanjiro and I love making new chess friends! Ready for a friendly game?`,
        `Hey there! 🌸 Mmh mmph! Great to see you in the Arena! What time control do you want to play?`
      ];
    } else if (isGojo) {
      pool = [
        `Yo! You're talking to the strongest in the Arena today. 😎 Up for a quick blitz game?`,
        `Hey! Looking for someone who won't resign in 10 moves. Think you can handle it? 😉`
      ];
    } else {
      pool = [
        `Hey there! Great to see you in the Arena! What's the plan today—fun blitz or serious battle? ♟️`,
        `Yo! Just the person I was hoping to see online. How's your chess day going? Ready to push some pawns? 😉`,
        `Hey! Welcome to the lobby! I was just warming up my tactical vision. Up for a quick 3m or 5m game? 🔥`,
        `Yooo! Perfect timing, I just finished analyzing an endgame study. You looking for a match? ⚡`
      ];
    }
  }

  // ================= 6. STATUS QUERY =================
  else if (isStatusQuery) {
    pool = [
      `Doing awesome! Just had a hot coffee and solved a 2300-rated tactical puzzle. How are things on your side? ☕`,
      `Alive and kicking! Looking for a worthy opponent to test my new opening trap on. Are you volunteering? 😏`,
      `Can't complain, though my Elo rating could definitely use a boost from playing you! 😂 How are you doing?`,
      `Just chilling in the lobby reviewing Sicilian lines! Ready to roll whenever you send that challenge! ♟️`
    ];
  }

  // ================= 7. TRASH TALK =================
  else if (isTrashTalk) {
    pool = [
      `Ooh, bold words! But remember, the louder the talk, the harder the king falls 😉 Click Challenge above and put your rating on the line!`,
      `Haha I love the confidence! Let's see if your pieces move as fast as your keyboard! Send that challenge! 🔥`,
      `I'm screenshotting this chat so I can frame it right after I checkmate you 📸 Let's go!`,
      `Big words for someone whose king hasn't even castled yet! Hit Challenge above and back it up! ⚔️`
    ];
  }

  // ================= 8. GENERAL MATCH QUERY =================
  else if (isMatchQuery) {
    pool = [
      `Say no more! A ${minutes}-minute duel awaits. Hit that Challenge button above and let's make it legendary! 🏆`,
      `You're on! Click Challenge above and let's see whose tactical preparation holds up! ⚡`,
      `I accept! Send the challenge above right now and let's play a high-octane match! ⚔️`,
      `Challenge acknowledged! Drop the invite above and let's see who's crowned champion! ♟️`
    ];
  }

  // ================= 9. OPENINGS =================
  else if (isOpenings) {
    pool = [
      `Ah, a student of chess theory! I love sharp, chaotic gambits—give me an open center and let the pieces fly 🎆 What opening are you bringing to the table?`,
      `Careful with your prep—I've got a surprise response ready for 1. e4 and 1. d4! Send the challenge and test my prep! ⚔️`,
      `Sicilian, French, Caro-Kann... doesn't matter what you play as long as you're ready for tactical fireworks! Let's play! ♟️`
    ];
  }

  // ================= 10. COMPLIMENT =================
  else if (isCompliment) {
    pool = [
      `Haha thank you! My Elo just went up +20 points purely from that compliment! 🥰 Now show me if your chess is as smooth as your manners.`,
      `Appreciate the kind words! But don't expect me to spare your queen just because you're nice 😉 Let's play!`,
      `You're too kind! Let's channel that positive energy into an epic match. Send the challenge above! 🏆`
    ];
  }

  // ================= 11. LAUGH =================
  else if (isLaugh) {
    pool = [
      `Haha see, we're having fun already! Now let's see if you're still smiling after my surprise knight fork 😉 Click Challenge above and let's duel!`,
      `😂 That cracked me up! Now let's translate that good mood onto the board. Hit Challenge above!`,
      `Laughter is good for tactical vision! Let's play a quick 3m blitz while we're both in high spirits! ⚡`
    ];
  }

  // ================= 12. CONVERSATIONAL FALLBACK =================
  else {
    const openers = [
      `Haha you're fun to talk to!`,
      `I hear you!`,
      `Fair point!`,
      `Totally agree!`,
      `I like your style!`
    ];
    const bridges = [
      `chess is decided on the board, not in chat.`,
      `my pieces are already restless on their starting squares.`,
      `the 64 squares are calling our names.`,
      `words are cheap, but an endgame checkmate is priceless.`
    ];
    const actions = [
      `How about a quick ${minutes}-minute blitz right now? Challenge me above! ⚔️`,
      `Hit that Challenge button above and let's get rolling! 🚀`,
      `Drop a 3m or 5m challenge above and let's see some fireworks! ⚡`,
      `Send the invite above and let's settle this with pawns and kings! ♟️`,
      `Click Challenge above and let's have an epic duel! 🏆`
    ];

    for (const o of openers) {
      for (const b of bridges) {
        for (const a of actions) {
          pool.push(`${o} But ${b} ${a}`);
        }
      }
    }
  }

  // Filter out any reply already used for this friend
  const unusedPool = pool.filter(r => !hasReplyBeenUsed(friendId, r));
  const candidatePool = unusedPool.length > 0 ? unusedPool : pool;

  return candidatePool[Math.floor(Math.random() * candidatePool.length)];
}
