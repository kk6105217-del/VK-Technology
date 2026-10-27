import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isOwner } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || (isOwner ? '/admin' : '/account');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(isOwner ? '/admin' : '/account', { replace: true });
    }
  }, [isAuthenticated, isOwner, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      // Navigation will happen via effect or immediately
    } catch (err: any) {
      setErrorNotice(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-cyan-400 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Cpu size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Access your DIY Tech projects, saved components, and order tracking.
          </p>
        </div>

        {errorNotice && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-1">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-cyan-700 hover:underline">
            Register as Customer
          </Link>
        </div>
      </div>
    </div>
  );
};
