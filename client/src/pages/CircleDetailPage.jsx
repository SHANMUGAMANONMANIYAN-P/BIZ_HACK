import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Check,
  Compass,
  ArrowLeft,
  UserPlus,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import api from '../services/api';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';

export default function CircleDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCircleDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/circles/${id}`);
      if (res.data.success) {
        setCircle(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve circle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircleDetails();
  }, [id, isAuthenticated]);

  const handleToggleMembership = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      if (circle.isMember) {
        await api.delete(`/circles/${id}/leave`);
      } else {
        await api.post(`/circles/${id}/join`);
      }
      await refreshUser();
      fetchCircleDetails();
    } catch (err) {
      console.error('Error toggling membership:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading Help Circle...</p>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">{error || 'Circle not found'}</h2>
        <Link to="/circles" className="text-xs font-bold text-indigo-600 hover:underline">
          Back to Circles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Link
        to="/circles"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Help Circles
      </Link>

      {/* Circle Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {circle.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  {circle.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {circle.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-4">
                <span>{circle.membersCount} Members</span>
                <span>•</span>
                <span className="text-indigo-600">{circle.activeRequestsCount} Active Requests</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              to={`/requests/create`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Post Request Here
            </Link>

            <button
              disabled={actionLoading}
              onClick={handleToggleMembership}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                circle.isMember
                  ? 'border border-slate-300 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {circle.isMember ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Member (Click to Leave)
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" /> Join Circle
                </>
              )}
            </button>
          </div>
        </div>

        {/* Member Preview Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Circle Members ({circle.members?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {circle.members?.map((m) => (
              <Link
                key={m._id}
                to={`/profile/${m._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {m.name.charAt(0)}
                </div>
                <span>{m.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Circle Requests Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Requests in this Circle ({circle.requests?.length || 0})
          </h2>
        </div>

        {circle.requests?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800">No requests in this circle yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to post a request for circle members!</p>
            <Link
              to="/requests/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Request Help in {circle.name}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circle.requests.map((req) => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
