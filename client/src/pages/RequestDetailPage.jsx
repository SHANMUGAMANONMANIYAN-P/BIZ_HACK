import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  HeartHandshake,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Share2,
  AlertCircle,
  Sparkles,
  Award,
  Play,
  CheckCheck,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import HelperCoordinationBoard from '../components/HelperCoordinationBoard';
import TimelineStepper from '../components/TimelineStepper';
import OfferHelpModal from '../components/OfferHelpModal';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchRequestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  // Request status transitions by requester
  const handleStatusChange = async (newStatus, notes = '') => {
    try {
      setActionLoading(true);
      setStatusMsg('');
      const res = await api.patch(`/requests/${id}/status`, {
        status: newStatus,
        notes,
      });
      if (res.data.success) {
        setStatusMsg(`Request transitioned to ${newStatus}.`);
        fetchRequestDetails();
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to transition status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading request lifecycle...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">{error || 'Request not found'}</h2>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && request.requesterId && user._id.toString() === request.requesterId._id.toString();
  const confirmed = request.confirmedHelpersCount || 0;
  const required = request.helpersRequired || 1;
  const isFull = confirmed >= required;
  const userHasOffered = !!request.userOffer;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore Requests
        </Link>

        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} size="md" />
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Request Header & Actions Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-700">
                {request.category}
              </span>

              {request.circleId && (
                <Link
                  to={`/circles/${request.circleId._id}`}
                  className="px-3 py-1 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Circle: {request.circleId.name}
                </Link>
              )}

              <span className="text-slate-400">
                Posted {new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {request.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl whitespace-pre-line">
              {request.description}
            </p>
          </div>

          {/* Quick Action Side Panel */}
          <div className="lg:w-72 shrink-0 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            {/* Slot Counter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Helper Slots</span>
                <span className={`font-extrabold ${isFull ? 'text-emerald-700' : 'text-indigo-600'}`}>
                  {confirmed} / {required} Confirmed
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isFull ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (confirmed / required) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isFull ? 'All volunteer slots filled!' : `${Math.max(0, required - confirmed)} slots remaining`}
              </p>
            </div>

            {/* Actions for Non-Owner Community Members */}
            {!isOwner && (
              <div>
                {request.status === 'CLOSED' ? (
                  <div className="p-3 bg-slate-200/70 text-slate-600 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4" /> This request is closed
                  </div>
                ) : userHasOffered ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-xl text-center">
                    ✓ You have submitted an active offer ({request.userOffer.status})
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      setIsOfferModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    Offer Help Now
                  </button>
                )}
              </div>
            )}

            {/* Actions for Requester */}
            {isOwner && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Requester Controls
                </p>

                {/* Transition to IN PROGRESS */}
                {request.status === 'ACCEPTED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('IN PROGRESS', 'Assistance started.')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Assistance (IN PROGRESS)
                  </button>
                )}

                {/* Close Request Button */}
                {['ASSISTED', 'OPEN', 'ACCEPTED', 'IN PROGRESS'].includes(request.status) && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CLOSED', 'Requester finished and closed the request.')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Close Request
                  </button>
                )}
              </div>
            )}

            {/* Report Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                setIsReportModalOpen(true);
              }}
              className="w-full py-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Report this request
            </button>
          </div>
        </div>

        {/* Info Grid: Requester, Location, Date/Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
              {request.requesterId?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-900">{request.requesterId?.name || 'Anonymous'}</p>
              <p className="text-slate-500 text-[11px]">{request.requesterId?.department || 'Department'}</p>
              <Link
                to={`/profile/${request.requesterId?._id}`}
                className="text-[10px] text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
              >
                <Award className="w-3 h-3" /> View Passport
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Location</p>
              <p className="text-slate-500">{request.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Required Schedule</p>
              <p className="text-slate-500">{request.requiredDate} at {request.requiredTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* NOVELTY 2, 3 & 4: Coordinated Helper Management Board */}
      <HelperCoordinationBoard
        request={request}
        offers={request.offers || []}
        isOwner={isOwner}
        onRefresh={fetchRequestDetails}
      />

      {/* NOVELTY 4: Verified Assistance Timeline */}
      <TimelineStepper
        timeline={request.timeline || []}
        currentStatus={request.status}
      />

      {/* Offer Help Modal */}
      <OfferHelpModal
        request={request}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          setStatusMsg('Your help offer was submitted successfully!');
          fetchRequestDetails();
        }}
      />

      {/* Report Modal */}
      <ReportModal
        requestId={request._id}
        reportedUserId={request.requesterId?._id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
