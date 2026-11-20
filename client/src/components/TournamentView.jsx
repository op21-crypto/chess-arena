import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Shield, Plus, CheckCircle, Award } from 'lucide-react';

export function TournamentView({ currentUser, onPlayTournamentMatch }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTourney, setSelectedTourney] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneyFormat, setNewTourneyFormat] = useState('knockout');
  const [newTourneyMinutes, setNewTourneyMinutes] = useState(3);

  const fetchTournaments = () => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        setTournaments(data.tournaments || []);
        if (data.tournaments && data.tournaments.length > 0 && !selectedTourney) {
          setSelectedTourney(data.tournaments[0]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleJoin = (id) => {
    fetch(`/api/tournaments/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchTournaments();
          setSelectedTourney(data.tournament);
        } else {
          alert(data.error || 'Failed to join tournament');
        }
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTourneyName.trim()) return;

    fetch('/api/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: newTourneyName.trim(),
        format: newTourneyFormat,
        timeControl: { baseMinutes: Number(newTourneyMinutes), incrementSeconds: 2 },
        maxPlayers: 8
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.tournament) {
          setShowCreateModal(false);
          setNewTourneyName('');
          fetchTournaments();
          setSelectedTourney(data.tournament);
        }
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Create Tournament Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Championship Arena</h2>
            <p className="text-xs text-slate-400">Compete in Knockout, Swiss & Round-Robin tournaments</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Main Grid: Tournament List on Left, Bracket / Standings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tournament Cards List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Active Tournaments
          </h3>

          {tournaments.map((t) => {
            const isSelected = selectedTourney?.id === t.id;
            const isJoined = t.participants?.some(p => p.id === currentUser?.id);

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTourney(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 uppercase border border-slate-800">
                    {t.format}
                  </span>
                  <span className={`text-[11px] font-semibold capitalize ${
                    t.status === 'open' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    ● {t.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2">{t.name}</h4>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.participants?.length || 0} / {t.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.timeControl?.baseMinutes}m + {t.timeControl?.incrementSeconds}s</span>
                  </div>
                </div>

                {t.status === 'open' && !isJoined && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(t.id);
                    }}
                    className="w-full mt-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                  >
                    Join Tournament
                  </button>
                )}

                {isJoined && (
                  <div className="mt-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Registered</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tournament Bracket / Details */}
        <div className="lg:col-span-8">
          {selectedTourney ? (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTourney.name}</h3>
                  <p className="text-xs text-slate-400">{selectedTourney.description}</p>
                </div>
                {selectedTourney.winner && (
                  <div className="flex items-center gap-2 p-2 px-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold">
                    <Award className="w-4 h-4" />
                    <span>Champion: {selectedTourney.winner.username}</span>
                  </div>
                )}
              </div>

              {/* Bracket / Rounds Display */}
              {selectedTourney.rounds && selectedTourney.rounds.length > 0 ? (
                <div className="space-y-6">
                  {selectedTourney.rounds.map((round) => (
                    <div key={round.roundNumber} className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {round.name || `Round ${round.roundNumber}`}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {round.matches.map((match) => (
                          <div
                            key={match.matchId}
                            className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-semibold ${match.winner?.id === match.player1?.id ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                                {match.player1?.username || 'TBD'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {match.player1?.elo || 1200}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                              <span className={`font-semibold ${match.winner?.id === match.player2?.id ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                                {match.player2?.username || (match.status === 'bye' ? 'BYE' : 'TBD')}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {match.player2?.elo || 1200}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Participants</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedTourney.participants?.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                        <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full border border-slate-700" />
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block truncate">{p.username}</span>
                          <span className="text-[10px] text-amber-400 font-mono">{p.elo} ELO</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 italic bg-slate-900 border border-slate-800 rounded-2xl">
              Select a tournament to view brackets and standings
            </div>
          )}
        </div>
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Tournament</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Tournament Title</label>
              <input
                type="text"
                value={newTourneyName}
                onChange={e => setNewTourneyName(e.target.value)}
                placeholder="e.g. Saturday Night Blitz"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Format</label>
                <select
                  value={newTourneyFormat}
                  onChange={e => setNewTourneyFormat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="knockout">Single Knockout</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="swiss">Swiss System</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Duration</label>
                <select
                  value={newTourneyMinutes}
                  onChange={e => setNewTourneyMinutes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="1">1 Min (Bullet)</option>
                  <option value="3">3 Min (Blitz)</option>
                  <option value="5">5 Min (Blitz)</option>
                  <option value="10">10 Min (Rapid)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
