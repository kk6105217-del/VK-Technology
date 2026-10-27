import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login, isOwner, logout, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as owner, redirect to admin dashboard
  useEffect(() => {
    if (isOwner) {
      navigate('/admin', { replace: true });
    }
  }, [isOwner, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      // Wait momentarily for auth context refresh
      const storedRole = localStorage.getItem('diy_role');
      if (storedRole !== 'OWNER') {
        logout();
        setError('Access Denied: This account is not authorized as Store Owner. Public customer accounts cannot access the owner console.');
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your owner credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillOwnerCredentials = () => {
    setEmail('karthik.suroju@gmail.com');
    setPassword('OwnerAdmin@2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-950/50">
            <ShieldCheck size={32} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              OWNER PORTAL
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            VK Technology
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Designated Store Owner & Administration Console
          </p>
        </div>

        <div className="mt-8 bg-slate-900/90 backdrop-blur-md border border-slate-800 py-8 px-6 sm:px-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Owner Email or Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. Admin@vktechnology or email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Owner Secure Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50 text-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Authenticate as Store Owner</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> Return to Storefront
            </Link>
          </div>
        </div>

        {/* Security badge notice */}
        <p className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          VK Technology Owner Console · Strict Server-Side Role Enforcement
        </p>
      </div>
    </div>
  );
};
