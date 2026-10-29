import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password
      });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen py-10 px-4 flex flex-col justify-center items-center">
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

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-300 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Create Account</h1>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded text-xs mb-4 flex items-center">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="First and last name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Email *</label>
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
            <label className="block font-bold text-gray-800 mb-1">Mobile Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Password * (At least 6 characters)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Re-enter Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold py-2.5 rounded text-xs shadow-sm transition disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
          By creating an account, you agree to VK Technology's <Link to="/policy/terms-conditions" className="text-vk-blue hover:underline">Conditions of Use</Link> and <Link to="/policy/privacy-policy" className="text-vk-blue hover:underline">Privacy Notice</Link>.
        </p>

        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-vk-blue hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>

      {/* Clean Authentication Footer */}
      <div className="mt-8 text-center text-[11px] text-gray-500 space-x-3">
        <Link to="/policy/terms-conditions" className="text-vk-blue hover:underline">Conditions of Use</Link>
        <span className="text-gray-300">|</span>
        <Link to="/policy/privacy-policy" className="text-vk-blue hover:underline">Privacy Notice</Link>
        <span className="text-gray-300">|</span>
        <Link to="/contact" className="text-vk-blue hover:underline">Help</Link>
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center">
        © 2026, VK Technology DIY Tech Projects. All rights reserved.
      </p>
    </div>
  );
};
