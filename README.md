# CHESS ARENA ♟️
*Play. Challenge. Connect. Conquer.*

A complete, premium, fully functional multiplayer chess application and gaming platform inspired by Chess.com and Lichess.

---

## 🌟 Key Features

### 1. Authentication & Profiles
- **Guest Mode**: Instant one-click guest play with unique guest usernames.
- **Email & Password**: Registration and login with bcrypt hashing and JWT security.
- **Seeded Grandmasters & Admin**: Pre-seeded accounts (GrandmasterAdmin, VikingKing, SpeedDemon, TacticalQueen).
- **Player Statistics**: Career matches, wins, losses, draws, win rate percentage, winning streaks.
- **Progression Tiers**: Beginner (0-1000) → Learner (1000-1200) → Intermediate (1200-1400) → Skilled (1400-1600) → Advanced (1600-1800) → Expert (1800-2000) → Master (2000-2300) → Elite (2300+).
- **Country Flags**: Country selection with international flags.
- **Real-Time Online Presence**: Socket.IO connection mapping.

### 2. Chess Gameplay & Engine
- **Server-Authoritative Rules**: Complete standard FIDE chess rules via `chess.js` (Castling, En Passant, Pawn Promotion, Check, Checkmate, Stalemate, 50-move rule, Threefold repetition).
- **Interactive Chessboard**:
  - Drag-and-drop & Tap-to-move (mobile-optimized).
  - Legal move indicator dots and capture rings.
  - Last move highlighting (from/to squares).
  - King-in-check pulsing red glow.
  - Board flip orientation.
  - 5 Board Themes: Tournament Emerald, Classic Walnut, Ocean Cobalt, Midnight Cyber, Royal Purple.
  - High-fidelity Web Audio Synthesizer: zero CDN dependencies for moves, captures, checks, castling, victory, low-time ticks, and chat pings.

### 3. Multiplayer Modes
- **Play With Friends**:
  - Create private room with custom time controls (1m, 3m, 5m, 10m, 15m, 30m) and color preference.
  - Instant shareable invitation link (`/?room=<roomId>`).
  - WhatsApp & Telegram direct share integration.
  - Rematch requests and color swapping.
- **Random Matchmaking**:
  - Queue pool matching players within ELO window across Bullet, Blitz, Rapid, Classical.
- **Spectator Mode**:
  - Watch live active games with real-time moves, clocks, and spectator counter.

### 4. Real-Time Chat & WebRTC Voice Chat
- **In-Game Chat**: Live text messaging, emojis (♟️, 👑, 🔥, 👏, 🏆, 👍), and quick phrases ("Good luck!", "Well played!", "Rematch?").
- **WebRTC Voice Chat**:
  - Mutual consent protocol: calls only connect when both players accept.
  - Microphone mute/unmute, Speaker deafen, audio activity detection, volume waveform equalizer, and disconnect button.

### 5. Stockfish 19 WASM Analysis & AI
- **Play vs AI**: 5 selectable difficulty levels (Beginner ~800 to Grandmaster ~2500+).
- **Full Game Review**:
  - Accuracy percentages (CAPS calculation) for White and Black.
  - Move classifications: Best Move (✨), Excellent (🟢), Good (🔵), Inaccuracy (🟡), Mistake (🟠), Blunder (🔴).
  - Dynamic evaluation bar (-10 to +10, Mate in N).
  - Engine recommendations and interactive move replay.

### 6. Tournaments & Leaderboards
- **Tournaments**: Knockout, Round-robin, and Swiss tournaments with brackets, live standings, and champion badges.
- **Global Leaderboards**: Filterable by Bullet, Blitz, Rapid, and Classical with player ranks and country flags.
- **Friend Arena**: Search users, send friend requests, accept/decline, and challenge friends to matches.
- **Admin Command Center**: System overview metrics, active games monitor, and player account suspension/moderation.

---

## 🚀 Getting Started

### 1. Start Server & Client
```bash
# Run server (serves both API, Socket.IO WebSockets and the built frontend)
pnpm start
```
The app will be accessible at `http://localhost:3001`!

### 2. Development Mode
```bash
# If developing client with hot reload:
pnpm run dev
```

### 3. Run Test Suite
```bash
node tests/test-arena.js
```
