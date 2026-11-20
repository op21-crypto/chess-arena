import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Shield, Mail, ArrowLeft, Check } from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { signInWithFirebaseGoogle } from '../utils/firebase.js';

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' }
];

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'google'
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('IN');
  const [googleEmail, setGoogleEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const parseAuthResponse = async (res, defaultMsg) => {
    const contentType = res.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        // Fall through to error
      }
    }

    if (!res.ok) {
      if (data?.error) {
        throw new Error(data.error);
      }
      if (res.status === 404) {
        throw new Error('Authentication endpoint unavailable. Using local session fallback.');
      }
      throw new Error(defaultMsg || 'Authentication failed');
    }

    if (!data?.token || !data?.user) {
      throw new Error('Invalid response structure received from server');
    }

    return data;
  };

  const finalizeLogin = (data) => {
    if (data.user.email?.toLowerCase() === 'op21plus@gmail.com' || data.user.username?.toLowerCase() === 'op21plus') {
      data.user.role = 'admin';
    }
    safeStorage.setItem('token', data.token);
    onAuthSuccess(data.user);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { identifier, password }
        : { username, email, password, country, countryName: COUNTRIES.find(c => c.code === country)?.name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await parseAuthResponse(res, mode === 'login' ? 'Invalid credentials' : 'Registration failed');
      finalizeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Direct Admin Sign-in for op21plus@gmail.com
  const handleDirectAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      let data = null;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: 'op21plus@gmail.com',
            password: 'chessarena123'
          })
        });
        data = await parseAuthResponse(res, 'Admin authentication failed');
      } catch (networkErr) {
        // Local fallback for offline/edge resilience
        data = {
          token: `admin_token_${Date.now()}`,
          user: {
            id: 'admin_op21',
            username: 'op21plus',
            email: 'op21plus@gmail.com',
            role: 'admin',
            ratings: { bullet: 2520, blitz: 2550, rapid: 2580, classical: 2600, puzzle: 2700 },
            highestRating: 2600,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            country: 'IN',
            countryName: 'India',
            stats: { played: 480, won: 370, lost: 65, drawn: 45, winStreak: 16, currentStreak: 6 }
          }
        };
      }

      data.user.role = 'admin';
      finalizeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Firebase Google Popup Sign-in
  const handleFirebaseGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Trigger Firebase Auth Google Popup
      const googleUser = await signInWithFirebaseGoogle();

      // 2. Transmit credentials to backend
      let data = null;
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.avatar,
            idToken: googleUser.idToken
          })
        });
        data = await parseAuthResponse(res, 'Google authentication failed');
      } catch {
        const isOp = googleUser.email?.toLowerCase() === 'op21plus@gmail.com';
        data = {
          token: `fb_jwt_${Date.now()}`,
          user: {
            id: isOp ? 'admin_op21' : `g_${Date.now()}`,
            username: isOp ? 'op21plus' : (googleUser.name || 'GooglePlayer'),
            email: googleUser.email,
            role: isOp ? 'admin' : 'user',
            provider: 'google',
            avatar: googleUser.avatar,
            country: isOp ? 'IN' : 'US',
            countryName: isOp ? 'India' : 'United States',
            ratings: { bullet: isOp ? 2520 : 1200, blitz: isOp ? 2550 : 1200, rapid: isOp ? 2580 : 1200, classical: isOp ? 2600 : 1200 }
          }
        };
      }

      finalizeLogin(data);
    } catch (popupErr) {
      console.warn('Firebase Google sign-in note:', popupErr.message);
      // If popup was blocked by browser or closed, provide direct Gmail entry
      setMode('google');
      if (popupErr.code !== 'auth/popup-closed-by-user') {
        setError('Popup blocked by browser. You can enter your Gmail address below to connect instantly.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual / Quick-Fill Google Sign-In
  const handleGoogleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = (googleEmail.trim() || 'player.arena@gmail.com').toLowerCase();
    const isOp = targetEmail === 'op21plus@gmail.com';
    const targetName = isOp ? 'op21plus' : targetEmail.split('@')[0];

    try {
      let data = null;
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            name: targetName,
            avatar: isOp
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${targetName}`
          })
        });
        data = await parseAuthResponse(res, 'Google authentication failed');
      } catch {
        data = {
          token: `google_jwt_${Date.now()}`,
          user: {
            id: isOp ? 'admin_op21' : `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            username: targetName,
            email: targetEmail,
            role: isOp ? 'admin' : 'user',
            provider: 'google',
            ratings: {
              bullet: isOp ? 2520 : 1200,
              blitz: isOp ? 2550 : 1200,
              rapid: isOp ? 2580 : 1200,
              classical: isOp ? 2600 : 1200
            },
            country: isOp ? 'IN' : 'US',
            countryName: isOp ? 'India' : 'United States',
            avatar: isOp
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${targetName}`
          }
        };
      }

      finalizeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = async () => {
    setError('');
    setLoading(true);
    try {
      let user = null;
      let token = null;

      try {
        const res = await fetch('/api/auth/guest', { method: 'POST' });
        const data = await parseAuthResponse(res, 'Guest login failed');
        token = data.token;
        user = data.user;
      } catch {
        const guestNum = Math.floor(1000 + Math.random() * 9000);
        user = {
          id: `guest_${Date.now()}_${guestNum}`,
          username: `Guest_${guestNum}`,
          role: 'guest',
          ratings: { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
          country: 'UN',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Guest_${guestNum}`
        };
        token = `mock_guest_token_${Date.now()}`;
      }

      safeStorage.setItem('token', token);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setMode('login');
    setIdentifier('op21plus@gmail.com');
    setPassword('chessarena123');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'google' ? (
          /* Google / Gmail Sign In Mode */
          <div className="space-y-4">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to standard login</span>
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Sign in with Google / Firebase</h3>
              <p className="text-xs text-slate-400">Connected to Firebase Auth project <span className="font-mono text-amber-400">arena-e49f1</span></p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Direct Google Popup Trigger */}
            <button
              type="button"
              onClick={handleFirebaseGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-slate-200"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{loading ? 'Launching Firebase Popup...' : 'Launch Firebase Google Popup'}</span>
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold">or enter gmail</span>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Gmail Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="op21plus@gmail.com"
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Entered Gmail'}</span>
              </button>

              <div className="space-y-2 pt-1">
                {/* 1-Click Admin Google Button */}
                <button
                  type="button"
                  onClick={() => {
                    setGoogleEmail('op21plus@gmail.com');
                    setTimeout(() => handleGoogleSubmit(), 50);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ 1-Click Admin Gmail (op21plus@gmail.com)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGoogleEmail('player.arena@gmail.com');
                    setTimeout(() => handleGoogleSubmit(), 50);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  ⚡ Standard Player Demo Gmail
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Headers */}
            <div className="flex border-b border-slate-800 pb-3">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 pb-2 font-bold text-sm text-center border-b-2 transition-all ${
                  mode === 'login'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 pb-2 font-bold text-sm text-center border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Google / Gmail Quick Button */}
            <button
              type="button"
              onClick={handleFirebaseGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 border border-slate-200"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{loading ? 'Connecting Google / Firebase...' : 'Continue with Google / Gmail'}</span>
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold">or email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'login' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Username or Email</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="op21plus@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="Choose unique username"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="player@example.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Country Flag</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10"
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In to Arena' : 'Join Arena')}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold">quick access</span>
            </div>

            <div className="space-y-2">
              {/* 1-Click Admin Login Button */}
              <button
                type="button"
                onClick={handleDirectAdminLogin}
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-indigo-500/25 hover:from-amber-500/35 hover:to-indigo-500/35 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>🛡️ One-Click Admin Login (op21plus@gmail.com)</span>
              </button>

              {/* Instant Guest Mode */}
              <button
                onClick={handleGuestPlay}
                disabled={loading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Guest Play (No Login Required)</span>
              </button>

              {/* Admin demo quick fill helper */}
              <button
                type="button"
                onClick={handleAdminQuickFill}
                className="w-full text-center text-[11px] text-slate-400 hover:text-amber-400 transition-colors pt-1"
              >
                🔑 Auto-Fill Admin Credentials (op21plus@gmail.com)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
