import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  BookOpen,
  Laptop,
  PartyPopper,
  Truck,
  Home,
  Package,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import UrgencyBadge from './UrgencyBadge';

const categoryIcons = {
  Education: BookOpen,
  Technology: Laptop,
  Events: PartyPopper,
  Transportation: Truck,
  Household: Home,
  Moving: Package,
  Community: HeartHandshake,
  Other: Sparkles,
};

export default function RequestCard({ request, relevanceReasons = [] }) {
  const Icon = categoryIcons[request.category] || HeartHandshake;
  const confirmed = request.confirmedHelpersCount || 0;
  const required = request.helpersRequired || 1;
  const percent = Math.min(100, Math.round((confirmed / required) * 100));
  const isFull = confirmed >= required;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top row: Category tag, Urgency, Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              {request.category}
            </span>

            {request.circleId ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                <Users className="w-3 h-3 text-slate-500" />
                {request.circleId.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-150">
                Global
              </span>
            )}
          </div>

          <StatusBadge status={request.status} size="xs" />
        </div>

        {/* Explainability Reason Chips for Rule-Based Discovery */}
        {relevanceReasons && relevanceReasons.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Match Rule: </span>
              {relevanceReasons.join(' • ')}
            </div>
          </div>
        )}

        {/* Title & Description */}
        <Link to={`/requests/${request._id}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            {request.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {request.description}
        </p>
      </div>

      {/* Middle: Location, Date, Time info */}
      <div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{request.location}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{request.requiredDate}</span>
          </div>
        </div>

        {/* Multi-Helper Progress Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Helper Slots
            </span>
            <span
              className={`font-bold ${
                isFull ? 'text-emerald-700' : 'text-indigo-600'
              }`}
            >
              {confirmed} / {required} Confirmed
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFull ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {isFull && (
            <span className="text-[10px] font-bold text-emerald-700 mt-1 block text-right">
              ✓ Helper slots filled
            </span>
          )}
        </div>

        {/* Bottom footer: Requester Info & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              {request.requesterId?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {request.requesterId?.name || 'Anonymous'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {request.requesterId?.department || 'General'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={request.urgency} />
            <Link
              to={`/requests/${request._id}`}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
