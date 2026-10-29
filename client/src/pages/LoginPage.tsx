import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen py-10 px-4 flex flex-col justify-center items-center">
      {/* Brand Header */}
      <Link to="/" className="flex items-center space-x-3 mb-6 group">
        <img
          src="/logo.png"
          alt="VK Technology Logo"
          className="w-12 h-12 object-contain rounded-full bg-white p-1 shadow-md transform group-hover:scale-105 transition-transform shrink-0"
        />
        <div className="flex items-center text-gray-900 text-left">
          <span className="text-2xl font-black">VK</span>
          <span className="text-2xl font-bold text-amber-500 ml-1.5">TECHNOLOGY</span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-300 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Sign in</h1>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded text-xs mb-4 flex items-center">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Email or mobile phone number
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-gray-800">Password</label>
              <Link to="/forgot-password" className="text-vk-blue hover:underline">
                Forgot your password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold py-2.5 rounded text-xs shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
          By continuing, you agree to VK Technology's <Link to="/policy/terms-conditions" className="text-vk-blue hover:underline">Conditions of Use</Link> and <Link to="/policy/privacy-policy" className="text-vk-blue hover:underline">Privacy Notice</Link>.
        </p>
      </div>

      {/* New to VK Technology divider */}
      <div className="w-full max-w-sm mt-6 text-center">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300" />
          <span className="flex-shrink mx-3 text-xs text-gray-500 font-medium">
            New to VK Technology?
          </span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <Link
          to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="block w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-bold py-2.5 rounded text-xs shadow-sm transition mt-2 text-center"
        >
          Create your VK Technology account
        </Link>
      </div>
    </div>
  );
};
