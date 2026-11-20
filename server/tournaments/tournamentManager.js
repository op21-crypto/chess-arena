import { Database } from '../db/database.js';

export class TournamentManager {
  constructor() {
    this.activeTournaments = new Map();
    this.loadFromDb();
  }

  loadFromDb() {
    const tourneys = Database.getAllTournaments();
    for (const t of tourneys) {
      this.activeTournaments.set(t.id, t);
    }

    // Seed default upcoming/active tournaments if none exist
    if (this.activeTournaments.size === 0) {
      this.createTournament({
        name: 'Arena Blitz Championship 2026',
        format: 'knockout', // 'knockout' | 'round-robin' | 'swiss'
        timeControl: { baseMinutes: 3, incrementSeconds: 2 },
        maxPlayers: 8,
        description: 'Elite 8-player knockout showdown with grandmaster prestige.',
        createdBy: 'admin_001',
        isPublic: true,
        status: 'open' // 'open', 'ongoing', 'completed'
      });

      this.createTournament({
        name: 'Grand Prix Rapid Open',
        format: 'round-robin',
        timeControl: { baseMinutes: 10, incrementSeconds: 0 },
        maxPlayers: 6,
        description: 'Every player battles everyone! Supreme test of endurance and tactical grit.',
        createdBy: 'admin_001',
        isPublic: true,
        status: 'open'
      });

      this.createTournament({
        name: 'Swiss Masters Arena Trophy',
        format: 'swiss',
        timeControl: { baseMinutes: 5, incrementSeconds: 3 },
        maxPlayers: 12,
        description: 'Swiss-system tournament matching players with identical scores each round.',
        createdBy: 'admin_001',
        isPublic: true,
        status: 'open'
      });
    }
  }

  createTournament({ name, format, timeControl, maxPlayers = 8, description, createdBy, isPublic = true }) {
    const id = `tourney_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tournament = {
      id,
      name,
      format, // knockout, round-robin, swiss
      timeControl,
      maxPlayers,
      description,
      createdBy,
      isPublic,
      status: 'open', // open, ongoing, completed
      participants: [], // array of { id, username, elo, avatar, score: 0 }
      rounds: [], // array of rounds with matches: { matchId, player1, player2, winner, gameId, status }
      currentRound: 0,
      winner: null,
      createdAt: new Date().toISOString()
    };

    // Auto-register seeded grandmasters to make active tournaments feel vibrant
    const seedIds = ['player_magnus', 'player_hikaru', 'player_gukesh', 'player_judit'];
    seedIds.slice(0, Math.min(seedIds.length, Math.floor(maxPlayers / 2))).forEach(pid => {
      const u = Database.getUserById(pid);
      if (u) {
        tournament.participants.push({
          id: u.id,
          username: u.username,
          elo: u.ratings.rapid || 1500,
          avatar: u.avatar,
          score: 0
        });
      }
    });

    this.activeTournaments.set(id, tournament);
    Database.saveTournament(tournament);
    return tournament;
  }

  joinTournament(tournamentId, user) {
    const tourney = this.activeTournaments.get(tournamentId);
    if (!tourney) return { success: false, error: 'Tournament not found' };
    if (tourney.status !== 'open') return { success: false, error: 'Tournament registration is closed' };
    if (tourney.participants.some(p => p.id === user.id)) {
      return { success: false, error: 'Already registered' };
    }
    if (tourney.participants.length >= tourney.maxPlayers) {
      return { success: false, error: 'Tournament is full' };
    }

    tourney.participants.push({
      id: user.id,
      username: user.username,
      elo: user.ratings?.rapid || 1200,
      avatar: user.avatar,
      score: 0
    });

    // If full, auto-start tournament
    if (tourney.participants.length >= tourney.maxPlayers) {
      this.startTournament(tournamentId);
    }

    Database.saveTournament(tourney);
    return { success: true, tournament: tourney };
  }

  startTournament(tournamentId) {
    const tourney = this.activeTournaments.get(tournamentId);
    if (!tourney || tourney.participants.length < 2) return null;

    tourney.status = 'ongoing';
    tourney.currentRound = 1;

    if (tourney.format === 'knockout') {
      this.generateKnockoutRound(tourney, 1);
    } else if (tourney.format === 'round-robin') {
      this.generateRoundRobinRounds(tourney);
    } else {
      this.generateSwissRound(tourney, 1);
    }

    Database.saveTournament(tourney);
    return tourney;
  }

  generateKnockoutRound(tourney, roundNum) {
    const activePlayers = roundNum === 1
      ? [...tourney.participants]
      : tourney.rounds[roundNum - 2].matches.map(m => m.winner).filter(Boolean);

    // Shuffle/Seed
    const matches = [];
    for (let i = 0; i < activePlayers.length; i += 2) {
      if (i + 1 < activePlayers.length) {
        matches.push({
          matchId: `m_${tourney.id}_r${roundNum}_${i / 2}`,
          round: roundNum,
          player1: activePlayers[i],
          player2: activePlayers[i + 1],
          winner: null,
          status: 'pending'
        });
      } else {
        // Bye for odd number
        matches.push({
          matchId: `m_${tourney.id}_r${roundNum}_${i / 2}`,
          round: roundNum,
          player1: activePlayers[i],
          player2: null,
          winner: activePlayers[i],
          status: 'bye'
        });
      }
    }

    tourney.rounds.push({
      roundNumber: roundNum,
      name: roundNum === 3 ? 'Finals' : (roundNum === 2 ? 'Semi-Finals' : `Round ${roundNum}`),
      matches
    });
  }

  generateRoundRobinRounds(tourney) {
    const n = tourney.participants.length;
    const players = [...tourney.participants];
    if (n % 2 !== 0) players.push(null); // dummy for bye

    const numRounds = players.length - 1;
    const half = players.length / 2;

    for (let r = 0; r < numRounds; r++) {
      const matches = [];
      for (let i = 0; i < half; i++) {
        const p1 = players[i];
        const p2 = players[players.length - 1 - i];
        if (p1 && p2) {
          matches.push({
            matchId: `m_${tourney.id}_r${r + 1}_${i}`,
            round: r + 1,
            player1: p1,
            player2: p2,
            winner: null,
            status: 'pending'
          });
        }
      }
      tourney.rounds.push({
        roundNumber: r + 1,
        name: `Round ${r + 1}`,
        matches
      });

      // Rotate players
      players.splice(1, 0, players.pop());
    }
  }

  generateSwissRound(tourney, roundNum) {
    // Sort participants by score descending
    const sorted = [...tourney.participants].sort((a, b) => b.score - a.score);
    const matches = [];
    for (let i = 0; i < sorted.length; i += 2) {
      if (i + 1 < sorted.length) {
        matches.push({
          matchId: `m_${tourney.id}_r${roundNum}_${i / 2}`,
          round: roundNum,
          player1: sorted[i],
          player2: sorted[i + 1],
          winner: null,
          status: 'pending'
        });
      }
    }
    tourney.rounds.push({
      roundNumber: roundNum,
      name: `Swiss Round ${roundNum}`,
      matches
    });
  }

  recordMatchResult(tournamentId, matchId, winnerId) {
    const tourney = this.activeTournaments.get(tournamentId);
    if (!tourney) return;

    for (const round of tourney.rounds) {
      const match = round.matches.find(m => m.matchId === matchId);
      if (match) {
        const winner = [match.player1, match.player2].find(p => p && p.id === winnerId);
        match.winner = winner || null;
        match.status = 'completed';

        if (winner) {
          const participant = tourney.participants.find(p => p.id === winner.id);
          if (participant) participant.score = (participant.score || 0) + 1;
        }

        // Check if all matches in round are done
        const allDone = round.matches.every(m => m.status === 'completed' || m.status === 'bye');
        if (allDone) {
          if (tourney.format === 'knockout') {
            const winners = round.matches.map(m => m.winner).filter(Boolean);
            if (winners.length === 1) {
              tourney.status = 'completed';
              tourney.winner = winners[0];
            } else if (winners.length > 1) {
              tourney.currentRound++;
              this.generateKnockoutRound(tourney, tourney.currentRound);
            }
          }
        }
        break;
      }
    }

    Database.saveTournament(tourney);
    return tourney;
  }

  getTournament(id) {
    return this.activeTournaments.get(id) || Database.getTournamentById(id);
  }

  getAll() {
    return Array.from(this.activeTournaments.values());
  }
}

export const tournamentManager = new TournamentManager();
