import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn, AlertCircle, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        navigate('/explore');
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      setError('');
      const res = await login(demoEmail, 'password123');
      if (res.success) {
        navigate('/explore');
      } else {
        setError(res.message || 'Quick login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to Community Help Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to discover requests, offer help, and coordinate assistance.
          </p>
        </div>

        {/* 1-Click Judge Quick Login Personas */}
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-2">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>Judge 1-Click Quick Login Personas</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('sathesh@example.com')}
              className="p-2 rounded-xl bg-white border border-amber-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all"
            >
              <span className="font-bold text-slate-900 block truncate">Sathesh V</span>
              <span className="text-[10px] text-slate-500 block truncate">Requester Role</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tharun@example.com')}
              className="p-2 rounded-xl bg-white border border-amber-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all"
            >
              <span className="font-bold text-slate-900 block truncate">Tharun R</span>
              <span className="text-[10px] text-slate-500 block truncate">Helper 1</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya@example.com')}
              className="p-2 rounded-xl bg-white border border-amber-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all"
            >
              <span className="font-bold text-slate-900 block truncate">Priya S</span>
              <span className="text-[10px] text-slate-500 block truncate">Helper 2 / Peer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@communityhub.org')}
              className="p-2 rounded-xl bg-white border border-amber-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all"
            >
              <span className="font-bold text-rose-900 block truncate flex items-center gap-1">
                <Shield className="w-3 h-3 text-rose-600" /> Admin User
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Moderation</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {isExpired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
