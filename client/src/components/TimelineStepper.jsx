import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  CheckCheck,
  Lock,
  UserCheck,
  Send,
  Sparkles,
} from 'lucide-react';

export default function TimelineStepper({ timeline = [], currentStatus = 'OPEN' }) {
  // Standard milestone steps
  const steps = [
    { key: 'CREATED', label: 'Request Created', icon: Sparkles },
    { key: 'OFFER', label: 'Helper Offer Received', icon: Send },
    { key: 'ACCEPTED', label: 'Helper(s) Accepted', icon: UserCheck },
    { key: 'IN_PROGRESS', label: 'Assistance In Progress', icon: Clock },
    { key: 'HELPER_DONE', label: 'Assistance Completed', icon: CheckCircle2 },
    { key: 'VERIFIED', label: 'Requester Confirmed (Assisted)', icon: CheckCheck },
    { key: 'CLOSED', label: 'Request Closed', icon: Lock },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Verified Assistance Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, immutable log of real-world assistance coordination & verification.
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {timeline.length} recorded events
        </span>
      </div>

      {/* Chronological Event History Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400">No timeline history recorded yet.</p>
        ) : (
          timeline.map((event, idx) => {
            const isLast = idx === timeline.length - 1;
            return (
              <div key={event._id || idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                    isLast
                      ? 'border-indigo-600 text-indigo-600 shadow-xs'
                      : 'border-emerald-500 text-emerald-500'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isLast ? 'bg-indigo-600 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-150 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      {event.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(event.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      •{' '}
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {event.notes && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                      {event.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>
                      Actor:{' '}
                      <strong className="text-slate-700 font-semibold">
                        {event.changedBy?.name || 'System'}
                      </strong>
                    </span>
                    {event.newStatus && (
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Status: {event.newStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
