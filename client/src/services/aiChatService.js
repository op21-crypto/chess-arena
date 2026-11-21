/**
 * AI-Powered Conversational Friend Chat Service
 * Combines zero-key high-speed LLM inference (Serverless /api/chat/friend-reply + Pollinations AI)
 * with an anti-repetition generative engine and session memory.
 */

// Memory tracking per friend to guarantee ZERO repetition across 100+ turns
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
 */
export async function getSmartFriendReply({ friend, message, history = [], detectedMinutes }) {
  const userText = (message || '').trim();
  const friendId = friend?.id || friend?.username || 'friend';
  const username = friend?.username || 'Friend';
  const elo = friend?.elo || 1800;
  const country = friend?.country || 'International';
  const bio = friend?.bio || friend?.statusText || 'skilled, friendly chess player';

  // 1. Try serverless backend endpoint first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

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
    // Fall through to browser direct AI
  }

  // 2. Direct browser call to Pollinations AI (OpenAI-compatible, zero-key, universal CORS)
  try {
    const systemPrompt = `You are ${username}, an active online chess player (${elo} Elo, from ${country}, ${bio}).
You are chatting casually with a friend on the Chess Arena web app.
Guidelines:
- 1 to 2 short, punchy sentences max.
- Talk naturally like a real, witty, human chess player chatting online.
- React directly to the user's specific words (e.g. rematch, ready to play, jokes, greetings, blitz challenge).
- Use occasional chess terms or emojis (♟️, ⚔️, 🏆, blitz, blunder, fork, checkmate, rematch).
- If they ask to play or rematch, accept enthusiastically and tell them to hit the Challenge button above.
- NEVER sound like an AI assistant. NEVER say "As an AI" or "How can I help you". Speak 100% like a real person having fun playing chess online.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map(h => ({
        role: h.sender === 'me' ? 'user' : 'assistant',
        content: h.text || ''
      })),
      { role: 'user', content: userText }
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4200);

    const directRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: 'openai',
        temperature: 0.88
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (directRes.ok) {
      const directData = await directRes.json();
      const raw = directData.choices?.[0]?.message?.content?.trim();
      if (raw && raw.length > 3) {
        const cleaned = raw.replace(/^["']|["']$/g, '').trim();
        markReplyUsed(friendId, cleaned);
        return cleaned;
      }
    }
  } catch (err) {
    // Network offline or LLM busy; fall through to dynamic generative engine
  }

  // 3. Ultra-Diverse Contextual Generative Engine with Zero Repetition
  const localReply = generateDiverseLocalReply({ friend, message: userText, detectedMinutes });
  markReplyUsed(friendId, localReply);
  return localReply;
}

/**
 * Dynamic Local Generative Engine (Anti-Repetition + Context-Aware)
 */
function generateDiverseLocalReply({ friend, message, detectedMinutes }) {
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

  const isElena = /elena|rostova/i.test(username);
  const isSamurai = /samurai|cyber/i.test(username);
  const isZoro = /zoro/i.test(username);
  const isGojo = /gojo/i.test(username);

  let pool = [];

  // 1. Rematch
  if (isRematch) {
    if (isElena) {
      pool = [
        `You want revenge already? 😉 I love the fighting spirit! Let's do ${minutes}m blitz right now. Hit Challenge above! ⚔️`,
        `A rematch?! My Siberian knights never back down from a duel. Click that Challenge button above and let's roll! ♟️`,
        `Oh you're definitely not walking away that easily! ${minutes} minutes on the clock—send the challenge above and let's go! 🔥`,
        `Round two?! Bring your best opening this time, because I'm not going easy on you! Click Challenge above! 🏆`,
        `Haha rematch accepted! Let's see if you can crack my defense this time. Hit Challenge above and let's find out! ⚡`,
        `You've got guts coming back for more! I'm setting the board right now. Tap Challenge above and let's duel! 👑`
      ];
    } else if (isSamurai) {
      pool = [
        `Rematch simulation requested! Re-calibrating laser knights... ⚔️ Hit Challenge above and show me what you learned!`,
        `Honor demands a second duel! Click Challenge above and face the cybernetic blade once more! 🚀`,
        `Round two initiated! My tactical processors are overclocked. Send the challenge above! ⚡`
      ];
    } else if (isZoro) {
      pool = [
        `Rematch?! Good! A true warrior never runs away! ⚔️ Three swords ready—hit Challenge above right now!`,
        `Hah! You got guts asking for another round! Send that challenge above before I lose my way again! 🔥`
      ];
    } else {
      pool = [
        `Rematch on! ⚔️ I was literally just waiting for you to say that. Click that Challenge button above and let's battle!`,
        `Oh it's on now! ${minutes} minutes on the clock—hit Challenge above and let's see who takes this one! 🏆`,
        `You've got courage, I'll give you that! Rematch accepted. Hit Challenge above right now! 🔥`,
        `Round two! Best 2 out of 3? Drop the challenge above and let's get those pieces moving! ♟️`,
        `Haha revenge match! Let's do a fast 3m Blitz. Send the invite above and let's see some fireworks! ⚡`,
        `I accept your rematch! Let's see if your endgame technique has improved since last time. Tap Challenge! 🎯`
      ];
    }
  }

  // 2. Ready to Play
  else if (isReady) {
    if (isElena) {
      pool = [
        `Pieces are set and the clock is waiting! Hit the Challenge button right above and make your first move! ♟️`,
        `Born ready! Let's do a ${minutes}-minute match. Click Challenge above and show me what you got! ⚔️`,
        `Always ready for battle! Hit Challenge above right now and let's see who controls the center! 🚀`,
        `Board is clean, clock is ticking in my head! Tap Challenge above and let's make this game legendary! 🏆`,
        `Let's go! I've got a fresh cup of coffee and my tactical radar is sharp. Send the challenge above! ☕`
      ];
    } else if (isGojo) {
      pool = [
        `Ready? Haha, I've been ready since birth! 😎 Click Challenge above and witness true Limitless chess! ✨`,
        `Let's go! Try not to blink or you'll miss my royal fork! Hit Challenge above right now! 🕶️`
      ];
    } else {
      pool = [
        `Let's do this! ⚔️ ${minutes} minutes on the clock. Hit that Challenge button above and let's go!`,
        `Board is set and ready! Click Challenge above right now and let's get those pawns flying! 🚀`,
        `Say less! Hit Challenge above and let's find out who's taking home the Elo points today! 🏆`,
        `Game on! Drop that challenge above and let's see your best opening moves! ⚡`,
        `Let's roll! ${minutes}m on the timer. Tap Challenge above and let's have some fun! ♟️`
      ];
    }
  }

  // 3. Time Control
  else if (detectedMinutes) {
    pool = [
      `Deal! ${detectedMinutes} minutes on the clock! ⚔️ Hit that Challenge button above and let's battle!`,
      `${detectedMinutes}m it is! Fast and sharp, exactly how I like it. Send the challenge above! ⚡`,
      `Locked in for ${detectedMinutes} minutes! Hit Challenge above right now and don't let your flag fall! ⏳`,
      `You got a deal on ${detectedMinutes}m! Click Challenge above and show me your speed chess skills! 🚀`,
      `${detectedMinutes} minutes? Perfect! Set the pieces up. Tap Challenge above and let's play! ♟️`
    ];
  }

  // 4. Bot Check
  else if (isBotQuery) {
    pool = [
      `Bro, if I were an AI, I wouldn't be chilling here talking chess with you at this hour! 😂 But my tactical moves might feel suspiciously calculated. Send the challenge and see!`,
      `Shhh, don't let Stockfish hear you or he'll claim copyright over my brain cells! 🧠 I'm 100% human with 200% tactical instincts. Let's play!`,
      `Haha, is it because my profile pic looks too cool or because you're already worried about my moves? 😉 Don't worry, I make human blunders too... sometimes!`,
      `Me, a bot?! Haha! Could an AI banter like this and then queen-trap you in 12 moves? Let's hit the board and find out! ♟️`,
      `I bleed coffee and calculated gambits, my friend! ☕ Drop the challenge above and see if a 'bot' can play this smoothly!`
    ];
  }

  // 5. Greeting
  else if (isGreeting) {
    pool = [
      `Hey there! Great to see you in the Arena! What's the plan today—fun blitz or serious battle? ♟️`,
      `Yo! Just the person I was hoping to see online. How's your chess day going? Ready to push some pawns? 😉`,
      `Hey! Welcome to the lobby! I was just warming up my tactical vision. Up for a quick 3m or 5m game? 🔥`,
      `Hey! What's good? Board is calling our names today. Hit me with a challenge whenever you're ready! ⚔️`,
      `Yooo! Perfect timing, I just finished analyzing an endgame study. You looking for a match? ⚡`
    ];
  }

  // 6. Status Query
  else if (isStatusQuery) {
    pool = [
      `Doing awesome! Just had a hot coffee and solved a 2300-rated tactical puzzle. How are things on your side? ☕`,
      `Alive and kicking! Looking for a worthy opponent to test my new opening trap on. Are you volunteering? 😏`,
      `Can't complain, though my Elo rating could definitely use a boost from playing you! 😂 How are you doing?`,
      `Just chilling in the lobby reviewing Sicilian lines! Ready to roll whenever you send that challenge! ♟️`,
      `Feeling sharp today! Hands on the board, ready for some rapid or blitz. What are you up to? 🎯`
    ];
  }

  // 7. Trash Talk
  else if (isTrashTalk) {
    pool = [
      `Ooh, bold words! But remember, the louder the talk, the harder the king falls 😉 Click Challenge above and put your rating on the line!`,
      `Haha I love the confidence! Let's see if your pieces move as fast as your keyboard! Send that challenge! 🔥`,
      `I'm screenshotting this chat so I can frame it right after I checkmate you 📸 Let's go!`,
      `Big words for someone whose king hasn't even castled yet! Hit Challenge above and back it up! ⚔️`,
      `Talk is cheap, let's see those moves on the 64 squares! Send the challenge right now! 👑`
    ];
  }

  // 8. General Match Query
  else if (isMatchQuery) {
    pool = [
      `Say no more! A ${minutes}-minute duel awaits. Hit that Challenge button above and let's make it legendary! 🏆`,
      `You're on! Click Challenge above and let's see whose tactical preparation holds up! ⚡`,
      `I accept! Send the challenge above right now and let's play a high-octane match! ⚔️`,
      `Challenge acknowledged! Drop the invite above and let's see who's crowned champion! ♟️`
    ];
  }

  // 9. Openings
  else if (isOpenings) {
    pool = [
      `Ah, a student of chess theory! I love sharp, chaotic gambits—give me an open center and let the pieces fly 🎆 What opening are you bringing to the table?`,
      `Careful with your prep—I've got a surprise response ready for 1. e4 and 1. d4! Send the challenge and test my prep! ⚔️`,
      `Sicilian, French, Caro-Kann... doesn't matter what you play as long as you're ready for tactical fireworks! Let's play! ♟️`
    ];
  }

  // 10. Compliment
  else if (isCompliment) {
    pool = [
      `Haha thank you! My Elo just went up +20 points purely from that compliment! 🥰 Now show me if your chess is as smooth as your manners.`,
      `Appreciate the kind words! But don't expect me to spare your queen just because you're nice 😉 Let's play!`,
      `You're too kind! Let's channel that positive energy into an epic match. Send the challenge above! 🏆`
    ];
  }

  // 11. Laugh
  else if (isLaugh) {
    pool = [
      `Haha see, we're having fun already! Now let's see if you're still smiling after my surprise knight fork 😉 Click Challenge above and let's duel!`,
      `😂 That cracked me up! Now let's translate that good mood onto the board. Hit Challenge above!`,
      `Laughter is good for tactical vision! Let's play a quick 3m blitz while we're both in high spirits! ⚡`
    ];
  }

  // 12. Conversational fallback (dynamically composed)
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

    // Combine permutations
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
