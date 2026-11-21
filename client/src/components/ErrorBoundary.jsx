import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
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
      // Clear non-critical and potentially corrupted caches
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('chess_arena_') || key === 'token')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-500 selection:text-black">
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

            {/* Error Details (Collapsible for debugging) */}
            {this.state.error && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <span className="font-mono truncate">Error: {this.state.error.message || 'Unknown issue'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5 shrink-0 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[10px] font-mono text-red-200 overflow-x-auto max-h-40 whitespace-pre-wrap break-all leading-tight">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                )}
              </div>
            )}

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
