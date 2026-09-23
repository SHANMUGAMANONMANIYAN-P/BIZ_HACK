import React from 'react';
import { CircleDot, CheckCircle2, Clock, CheckCheck, Lock } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold',
  }[size];

  switch (status) {
    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CircleDot className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          OPEN
        </span>
      );
    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          ACCEPTED
        </span>
      );
    case 'IN PROGRESS':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          IN PROGRESS
        </span>
      );
    case 'ASSISTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-teal-50 text-teal-800 border border-teal-300 ${sizeClasses}`}
        >
          <CheckCheck className="w-4 h-4 text-teal-600" />
          ASSISTED
        </span>
      );
    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          CLOSED
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
