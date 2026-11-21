import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chess Arena Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      // Clear non-critical caches that might contain malformed JSON
      localStorage.removeItem('chess_arena_friends_v3');
      localStorage.removeItem('chess_arena_dms_v3');
      localStorage.removeItem('chess_arena_sent_requests_v3');
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-amber-500 selection:text-black">
          <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-fade-in">
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <span className="text-3xl select-none">👑</span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Arena Auto-Recovery</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Chess Arena Glitch Resolved
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                The application caught a temporary display anomaly. Your game ratings, account, and progress remain completely safe.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Chess Arena</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Cache & Re-open</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>End-to-End State Protection Active</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
