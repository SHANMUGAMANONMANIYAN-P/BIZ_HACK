import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  HeartHandshake,
  CheckCircle2,
  Users,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Tag,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ContributionPassportPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?._id;

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        setLoading(true);
        const url = targetId ? `/auth/passport/${targetId}` : '/auth/passport';
        const res = await api.get(url);
        if (res.data.success) {
          setPassport(res.data.passport);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve Contribution Passport.');
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      fetchPassport();
    }
  }, [targetId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Generating Contribution Passport...</p>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <Award className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="font-bold text-base text-slate-800">Passport Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Please log in to view passport.'}</p>
        <Link to="/login" className="text-xs font-bold text-indigo-600 hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  const { user: passportUser, stats, skills, recentContributions } = passport;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Passport Document Container */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/60 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Passport Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Verified Participation Record
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                CONTRIBUTION PASSPORT
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Platform Member ID
            </p>
            <p className="font-mono text-xs font-bold text-slate-300">
              CHH-{(passportUser._id || '').substring(0, 10).toUpperCase()}
            </p>
          </div>
        </div>

        {/* User Identity Row */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="sm:col-span-2 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 border-2 border-indigo-400 shadow-md">
              {passportUser.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {passportUser.name}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {passportUser.department || 'General Member'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {passportUser.location || 'Campus / Local'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  Member since {new Date(passportUser.memberSince).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Member Circles */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-indigo-400" />
              Help Circles ({passportUser.circles?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {passportUser.circles && passportUser.circles.length > 0 ? (
                passportUser.circles.map((c) => (
                  <span
                    key={c._id || c}
                    className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg"
                  >
                    {c.name || 'Circle'}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500">Not joined any circle yet</span>
              )}
            </div>
          </div>
        </div>

        {/* 5 Verified Participation Statistics (NO Points/Currency) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-8">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center hover:border-indigo-400 transition-colors">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 block mb-1">
              {stats.helpProvided}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Help Provided
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center hover:border-indigo-400 transition-colors">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block mb-1">
              {stats.helpReceived}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Help Received
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center hover:border-indigo-400 transition-colors">
            <span className="text-2xl sm:text-3xl font-black text-teal-400 block mb-1">
              {stats.requestsCompleted}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Tasks Closed
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center hover:border-indigo-400 transition-colors">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 block mb-1">
              {stats.groupActivities}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Group Assists
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center hover:border-indigo-400 transition-colors">
            <span className="text-2xl sm:text-3xl font-black text-sky-400 block mb-1">
              {stats.successfulAssists}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Assists
            </span>
          </div>
        </div>

        {/* Registered Skills */}
        <div className="relative z-10 pt-6 mt-6 border-t border-slate-700/60">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Verified & Registered Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-xl bg-white/10 text-slate-200 text-xs font-semibold border border-white/15 shadow-xs"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No skills listed</span>
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Transparent activity passport based on two-sided confirmed completions.
          </span>
          <span className="font-semibold text-amber-400">Zero AI • Zero Credits</span>
        </div>
      </div>

      {/* Chronological Verified Activity Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-teal-600" />
              Recent Verified Contributions Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of tasks assisted, volunteer drives participated in, and community support delivered.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recentContributions && recentContributions.length > 0 ? (
            recentContributions.map((c, index) => (
              <div
                key={c.id || index}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/80 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      c.type === 'ASSIST_PROVIDED'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {c.type === 'ASSIST_PROVIDED' ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <HeartHandshake className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {c.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="bg-slate-200/70 px-2 py-0.5 rounded font-medium">
                        {c.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(c.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 shrink-0 flex items-center gap-1">
                  ✓ VERIFIED
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No verified contributions recorded yet. Provide help on community requests to build your passport!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
