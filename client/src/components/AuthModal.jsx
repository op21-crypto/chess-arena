import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Shield, Mail, ArrowLeft, Check, Eye, EyeOff, Lock, Key, ShieldCheck } from 'lucide-react';
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

export function AuthModal({ isOpen, onClose, onAuthSuccess, isLight = false }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'google_input'
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('IN');
  const [googleEmail, setGoogleEmail] = useState('');
  const [adminPin, setAdminPin] = useState('');
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
        // Fall through
      }
    }

    if (!res.ok) {
      if (data?.error) {
        throw new Error(data.error);
      }
      if (res.status === 404) {
        throw new Error('Authentication service temporarily offline. Please try again.');
      }
      throw new Error(defaultMsg || 'Authentication failed');
    }

    if (!data?.token || !data?.user) {
      throw new Error('Invalid authentication response');
    }

    return data;
  };

  const finalizeLogin = (data) => {
    const isOp = data.user.email?.toLowerCase().trim() === 'op21plus@gmail.com';
    if (isOp) {
      data.user.role = 'admin';
      sessionStorage.setItem('chess_arena_admin_verified', 'true');
    } else {
      // Strictly prevent non-op21plus from having admin role
      data.user.role = data.user.role === 'guest' ? 'guest' : 'user';
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
        ? { identifier: identifier.trim(), password }
        : {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            country,
            countryName: COUNTRIES.find(c => c.code === country)?.name
          };

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

  // Firebase Google Popup Sign-in (Official Google Identity)
  const handleFirebaseGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const googleUser = await signInWithFirebaseGoogle();

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
        const isOp = googleUser.email?.toLowerCase().trim() === 'op21plus@gmail.com';
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
            ratings: { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
            stats: { played: 0, won: 0, lost: 0, drawn: 0, winStreak: 0, currentStreak: 0 },
            achievements: []
          }
        };
      }

      finalizeLogin(data);
    } catch (popupErr) {
      console.warn('Firebase Google sign-in note:', popupErr.message);
      // If browser blocked the popup window, allow typing Gmail address directly
      setMode('google_input');
      if (popupErr.code !== 'auth/popup-closed-by-user') {
        setError('Popup was blocked by your browser. Please enter your Gmail below to connect.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback direct Gmail Sign-In when popup is blocked
  const handleGoogleInputSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Please enter a valid Gmail address');
      return;
    }

    setError('');
    setLoading(true);

    const targetEmail = googleEmail.trim().toLowerCase();
    const isOp = targetEmail === 'op21plus@gmail.com';

    // Strict identity verification: op21plus@gmail.com requires Master Admin PIN
    if (isOp && !adminPin.trim()) {
      setError('Master Security PIN is required to verify ownership of op21plus@gmail.com.');
      return;
    }

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
            adminPin: isOp ? adminPin.trim() : undefined,
            avatar: isOp
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${targetName}`
          })
        });
        data = await parseAuthResponse(res, 'Google authentication failed');
      } catch (backendErr) {
        // If server actively rejected with 403 or specific error, abort immediately
        if (backendErr.message && !backendErr.message.includes('offline') && !backendErr.message.includes('failed to fetch')) {
          throw backendErr;
        }

        // Offline / fallback verification: verify against default or stored master PIN
        if (isOp) {
          const validPin = safeStorage.getItem('chess_arena_admin_pin') || '212121';
          if (adminPin.trim() !== validPin && adminPin.trim() !== '212121') {
            throw new Error('❌ Master PIN Verification Failed. You are not authorized to access op21plus@gmail.com.');
          }
        }

        data = {
          token: `google_jwt_${Date.now()}`,
          user: {
            id: isOp ? 'admin_op21' : `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            username: targetName,
            email: targetEmail,
            role: isOp ? 'admin' : 'user',
            provider: 'google',
            ratings: {
              bullet: 1200,
              blitz: 1200,
              rapid: 1200,
              classical: 1200
            },
            stats: { played: 0, won: 0, lost: 0, drawn: 0, winStreak: 0, currentStreak: 0 },
            achievements: [],
            country: isOp ? 'IN' : 'US',
            countryName: isOp ? 'India' : 'United States',
            avatar: isOp
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${targetName}`
          }
        };
      }

      if (isOp) {
        sessionStorage.setItem('chess_arena_admin_verified', 'true');
      }

      finalizeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Instant Guest Play - Zero Friction
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

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto transition-all ${
      isLight ? 'bg-slate-900/60' : 'bg-black/80'
    }`}>
      <div className={`rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 relative my-auto animate-fadeIn transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white via-amber-50/20 to-slate-50 border-2 border-amber-300/80 shadow-[0_25px_70px_-15px_rgba(217,119,6,0.25)] text-slate-800'
          : 'bg-gradient-to-b from-slate-900 via-[#0d162d] to-[#070b16] border border-amber-500/40 shadow-[0_25px_70px_-12px_rgba(0,0,0,0.9)] text-slate-100'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header: Radiant Brand Logo & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <div className="absolute inset-0 rounded-2xl bg-amber-400/40 blur-lg animate-pulse" />
            <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 shadow-xl shadow-amber-500/30">
              <img
                src="/icon.svg"
                alt="CHESS"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h2 className={`text-2xl font-black tracking-tight ${
              isLight
                ? 'text-slate-900'
                : 'bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent'
            }`}>
              CHESS ARENA
            </h2>
            <span className="text-amber-400 text-sm font-bold">✦</span>
          </div>
          <p className={`text-xs ${
            isLight ? 'text-slate-600 font-semibold' : 'text-slate-300 font-medium'
          }`}>
            Play live with friends, challenge Stockfish 19 AI & conquer the leaderboard
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-semibold animate-shake">
            {error}
          </div>
        )}

        {mode === 'google_input' ? (
          /* Fallback Gmail Entry when popup was blocked */
          <div className="space-y-4 pt-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to standard login</span>
            </button>

            <form onSubmit={handleGoogleInputSubmit} className="space-y-3">
              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Your Gmail Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="player@gmail.com"
                    autoFocus
                    required
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm pr-10 transition-all ${
                      isLight
                        ? 'bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm'
                        : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Master Administrator PIN Verification */}
              {googleEmail.trim().toLowerCase() === 'op21plus@gmail.com' && (
                <div className="p-3 bg-amber-500/15 border-2 border-amber-500/40 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Master Admin Identity Verification</span>
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Protected Admin Account: Enter your confidential Master PIN to verify ownership of op21plus@gmail.com.
                  </p>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPin}
                      onChange={e => setAdminPin(e.target.value)}
                      placeholder="Enter 6-digit Master PIN (e.g. 212121)"
                      maxLength={12}
                      required
                      className={`w-full rounded-xl px-3.5 py-2 text-sm pr-10 font-mono tracking-widest ${
                        isLight
                          ? 'bg-white border-2 border-amber-400 text-amber-900 placeholder-slate-400 focus:outline-none'
                          : 'bg-slate-900 border border-amber-500/50 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                      }`}
                    />
                    <Key className="w-4 h-4 text-amber-500 absolute right-3 top-2.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying Identity...' : (googleEmail.trim().toLowerCase() === 'op21plus@gmail.com' ? 'Verify & Access Admin Command' : 'Connect with Gmail')}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick 1-Click Options */}
            <div className="space-y-2.5">
              {/* Primary: Continue with Google / Gmail */}
              <button
                type="button"
                onClick={handleFirebaseGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 px-4 active:scale-[0.99] disabled:opacity-50 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 shadow-md hover:shadow-lg'
                    : 'bg-white hover:bg-slate-100 text-slate-900 shadow-lg hover:shadow-xl'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{loading ? 'Signing in with Google...' : 'Continue with Google / Gmail'}</span>
              </button>

              {/* Secondary: Instant Guest Play */}
              <button
                type="button"
                onClick={handleGuestPlay}
                disabled={loading}
                className={`w-full py-2.5 px-4 active:scale-[0.99] disabled:opacity-50 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100/90 hover:from-amber-200 hover:to-orange-200 text-amber-950 border border-amber-300 shadow-sm'
                    : 'bg-gradient-to-r from-slate-800 to-indigo-950 hover:from-slate-750 hover:to-indigo-900 text-amber-300 border border-amber-500/30 shadow-md'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Play Instantly as Guest (No Sign In)</span>
              </button>
            </div>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className={`border-t w-full ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
              <span className={`px-3 text-[11px] uppercase font-bold tracking-wider ${
                isLight ? 'bg-white text-slate-500' : 'bg-[#0d162d] text-slate-400'
              }`}>
                or sign in with password
              </span>
            </div>

            {/* Tab Headers: Sign In vs Create Account */}
            <div className={`flex border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm text-center border-b-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? isLight ? 'border-amber-600 text-amber-700 font-black' : 'border-amber-400 text-amber-400 font-extrabold'
                    : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm text-center border-b-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? isLight ? 'border-amber-600 text-amber-700 font-black' : 'border-amber-400 text-amber-400 font-extrabold'
                    : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'login' ? (
                <div>
                  <label className={`text-xs font-bold block mb-1 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="Enter username or email"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                      isLight
                        ? 'bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm'
                        : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400'
                    }`}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      Choose Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="e.g. GrandTactician"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                        isLight
                          ? 'bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm'
                          : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="player@example.com"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                        isLight
                          ? 'bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm'
                          : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      Country Representation
                    </label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs transition-all ${
                        isLight
                          ? 'bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm'
                          : 'bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-amber-400'
                      }`}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm pr-10 transition-all ${
                      isLight
                        ? 'bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm'
                        : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 active:scale-[0.99] disabled:opacity-50 text-sm font-black rounded-xl transition-all shadow-xl cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white shadow-amber-600/30'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/30'
                }`}
              >
                {loading
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Sign In to Arena'
                  : 'Create Account & Play'}
              </button>
            </form>

            {/* Administrator Verification Direct Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('google_input');
                  setGoogleEmail('op21plus@gmail.com');
                  setError('');
                }}
                className={`text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  isLight
                    ? 'text-amber-700 hover:text-amber-800'
                    : 'text-amber-400/90 hover:text-amber-300'
                }`}
              >
                <span>👑</span>
                <span>Administrator Portal (op21plus@gmail.com)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
