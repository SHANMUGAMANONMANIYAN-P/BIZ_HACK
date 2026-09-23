import React from 'react';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900">
                Community Help Hub
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              A trusted, full-stack community assistance platform that connects people who need help with people willing to help through focused <strong>Help Circles</strong>, <strong>Multi-Helper Coordination</strong>, and a verifiable <strong>Two-Sided Completion Lifecycle</strong>.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                Problem: PS58
              </span>
              <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Team: Neon Nexus
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Software • Zero AI • Zero Currency
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Novel Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Help Circles
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Multi-Helper Capacity (1→N)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Coordinated Assistance Board
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Two-Sided Verified Completion
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Contribution Passport
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Explainable Rule Discovery
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Community & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Strict status state machine</li>
              <li>Immutable request timeline</li>
              <li>Role-based access moderation</li>
              <li>Report submission & queue</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Community Help Hub. Built for Hackathon PS58 by Team Neon Nexus.</p>
          <p className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Verified & Structured Assistance
          </p>
        </div>
      </div>
    </footer>
  );
}
