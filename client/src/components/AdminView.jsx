import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Gamepad2, Ban, CheckCircle, AlertTriangle } from 'lucide-react';

export function AdminView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = () => {
    fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleModerate = (userId, banned) => {
    fetch(`/api/admin/users/${userId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ banned })
    })
      .then(res => res.json())
      .then(() => {
        setActionMessage(`User account status updated.`);
        fetchStats();
        setTimeout(() => setActionMessage(''), 3000);
      });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">Loading Admin Dashboard...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Administrator Command Center</h2>
            <p className="text-xs text-slate-400">Platform health metrics, player management and fair play moderation</p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
          {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Users</span>
          <div className="text-2xl font-bold font-mono text-white">{stats?.totalUsers || 0}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Online Players</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats?.activeOnline || 0}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Matches</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats?.totalGames || 0}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Live Games</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{stats?.ongoingGames || 0}</div>
        </div>
      </div>

      {/* Users Moderation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Registered Accounts ({stats?.users?.length || 0})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Rapid ELO</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {stats?.users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <img src={u.avatar} alt={u.username} className="w-6 h-6 rounded-full" />
                    <span>{u.username}</span>
                  </td>
                  <td className="py-2.5 px-3 capitalize">{u.role}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{u.ratings?.rapid || 1200}</td>
                  <td className="py-2.5 px-3">
                    {u.banned ? (
                      <span className="text-red-400 font-bold">Suspended</span>
                    ) : (
                      <span className="text-emerald-400">Active</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleModerate(u.id, !u.banned)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.banned
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300'
                        }`}
                      >
                        {u.banned ? 'Unban' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
