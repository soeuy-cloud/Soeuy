import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Lock, User, KeyRound, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setIsPasswordResetModalOpen } = useAccounting();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or corporate email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message || 'Invalid username or password');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#bf4700] to-[#f97316] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              S
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-white">
              Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            Enterprise Financial ERP & Accounting
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-xl text-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#f97316]" />
              <span>Sign In to Your Workspace</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access General Ledger, Tax filings, and Financial Statements.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="text-sm shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                <span>Username or Corporate Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your username or email"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPasswordResetModalOpen(true)}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium hover:underline transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#d65200] to-[#f97316] hover:from-[#bf4700] hover:to-[#ea580c] text-white font-bold rounded-lg shadow-md shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-xs"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Suite</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security and Version Badge */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>Suite Enterprise v2026.2</span>
        </div>
      </div>
    </div>
  );
};
