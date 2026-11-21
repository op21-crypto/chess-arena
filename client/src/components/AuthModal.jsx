import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Shield, Mail, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
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
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'google_input'
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 max-w-md w-full space-y-5 shadow-2xl relative my-auto animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome to Chess Arena</h2>
          <p className="text-xs text-slate-400">
            Play online with friends, challenge grandmaster AI & climb global rankings
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {mode === 'google_input' ? (
          /* Fallback Gmail Entry when popup was blocked */
          <div className="space-y-4 pt-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to standard login</span>
            </button>

            <form onSubmit={handleGoogleInputSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Gmail Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="player@gmail.com"
                    autoFocus
                    required
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Connecting...' : 'Connect with Gmail'}</span>
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
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] disabled:opacity-50 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 border border-slate-200 cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{loading ? 'Signing in with Google...' : 'Continue with Google / Gmail'}</span>
              </button>

              {/* Secondary: Instant Guest Play */}
              <button
                type="button"
                onClick={handleGuestPlay}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.99] disabled:opacity-50 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Play Instantly as Guest (No Sign In Required)</span>
              </button>
            </div>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                or sign in with password
              </span>
            </div>

            {/* Tab Headers: Sign In vs Create Account */}
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm text-center border-b-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm text-center border-b-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'login' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="Enter username or email"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Choose Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="e.g. GrandTactician"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="player@example.com"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Country Representation
                    </label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {loading
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Sign In to Arena'
                  : 'Create Account & Play'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
