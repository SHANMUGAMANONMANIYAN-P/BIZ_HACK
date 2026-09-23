import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  User,
  Shield,
  Award,
  AlertCircle,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HelperCoordinationBoard({
  request,
  offers = [],
  isOwner = false,
  onRefresh,
}) {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const confirmedCount = offers.filter((o) =>
    ['Accepted', 'In Progress', 'Completed'].includes(o.status)
  ).length;
  const helpersRequired = request.helpersRequired || 1;
  const isCapacityFull = confirmedCount >= helpersRequired;

  const handleAccept = async (offerId) => {
    try {
      setLoadingAction(`accept-${offerId}`);
      setErrorMsg('');
      const res = await api.patch(`/offers/${offerId}/accept`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept offer.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (offerId) => {
    try {
      setLoadingAction(`reject-${offerId}`);
      setErrorMsg('');
      const res = await api.patch(`/offers/${offerId}/reject`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reject offer.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Side 1: Helper marks completed
  const handleHelperComplete = async (offerId) => {
    try {
      setLoadingAction(`complete-${offerId}`);
      setErrorMsg('');
      const res = await api.patch(`/offers/${offerId}/complete`);
      if (res.data.success) {
        setSuccessMsg('Assistance marked completed! Requester notified for confirmation.');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to mark completion.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Side 2: Requester confirms completion
  const handleRequesterConfirm = async (offerId) => {
    try {
      setLoadingAction(`confirm-${offerId}`);
      setErrorMsg('');
      const res = await api.patch(`/offers/${offerId}/confirm`);
      if (res.data.success) {
        setSuccessMsg('Assistance verified and confirmed! Added to helper Contribution Passport.');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to confirm completion.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header with Slot Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Coordinated Assistance & Helper Management
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOwner
              ? 'Review volunteer offers, coordinate multiple helpers, and verify completed assistance.'
              : 'Assigned helpers and verified contribution progress for this task.'}
          </p>
        </div>

        {/* Capacity badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              isCapacityFull
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {confirmedCount} / {helpersRequired} Helpers Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        {offers.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No help offers received yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When community members volunteer, their offers will appear here for coordination.
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const isHelperUser =
              user && offer.helperId && user._id.toString() === (offer.helperId._id || offer.helperId).toString();
            const helperObj = offer.helperId || {};

            return (
              <div
                key={offer._id}
                className={`p-4 rounded-xl border transition-all ${
                  offer.status === 'Completed'
                    ? 'bg-teal-50/40 border-teal-200'
                    : offer.status === 'Accepted'
                    ? 'bg-blue-50/40 border-blue-200'
                    : offer.status === 'Rejected'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Helper Details */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {helperObj.name?.charAt(0) || 'H'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/profile/${helperObj._id}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {helperObj.name || 'Volunteer Helper'}
                          <Award className="w-3.5 h-3.5 text-indigo-500" />
                        </Link>

                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {helperObj.department || 'General'}
                        </span>

                        {/* Offer Status Pill */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            offer.status === 'Completed'
                              ? 'bg-teal-100 text-teal-800'
                              : offer.status === 'Accepted'
                              ? 'bg-blue-100 text-blue-800'
                              : offer.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : offer.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {offer.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Helper Message & Availability */}
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        <strong className="text-slate-900">Note: </strong>
                        "{offer.message}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                        {offer.availableDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Avail: {offer.availableDate} ({offer.availableTime || 'Anytime'})
                          </span>
                        )}

                        {helperObj.skills && helperObj.skills.length > 0 && (
                          <span>
                            Skills: {helperObj.skills.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Requester Actions for Pending Offers */}
                    {isOwner && offer.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isCapacityFull || !!loadingAction}
                          onClick={() => handleAccept(offer._id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                        >
                          {loadingAction === `accept-${offer._id}` ? 'Accepting...' : 'Accept Helper'}
                        </button>
                        <button
                          disabled={!!loadingAction}
                          onClick={() => handleReject(offer._id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Step 1 of Verification: Helper marks assistance completed */}
                    {isHelperUser &&
                      ['Accepted', 'In Progress'].includes(offer.status) &&
                      !offer.completedByHelper && (
                        <button
                          disabled={!!loadingAction}
                          onClick={() => handleHelperComplete(offer._id)}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 animate-bounce-subtle"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Assistance Completed
                        </button>
                      )}

                    {/* Helper status: Waiting for requester confirmation */}
                    {isHelperUser && offer.completedByHelper && !offer.confirmedByRequester && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Requester Confirmation
                      </span>
                    )}

                    {/* Step 2 of Verification: Requester confirms helper completion */}
                    {isOwner &&
                      offer.completedByHelper &&
                      !offer.confirmedByRequester && (
                        <button
                          disabled={!!loadingAction}
                          onClick={() => handleRequesterConfirm(offer._id)}
                          className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 animate-pulse"
                        >
                          <CheckCheck className="w-4 h-4" />
                          Confirm Completion ✓
                        </button>
                      )}

                    {/* Fully Completed & Verified state */}
                    {offer.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg">
                        <CheckCheck className="w-4 h-4 text-teal-600" />
                        Verified Complete
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
