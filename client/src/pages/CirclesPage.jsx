import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Check,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  Cpu,
  Home,
  HeartHandshake,
  UserPlus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateCircleModal from '../components/CreateCircleModal';

export default function CirclesPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const fetchCircles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/circles');
      if (res.data.success) {
        setCircles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching circles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [isAuthenticated]);

  const handleJoinCircle = async (e, circleId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setJoiningId(circleId);
      const res = await api.post(`/circles/${circleId}/join`);
      if (res.data.success) {
        await refreshUser();
        fetchCircles();
      }
    } catch (err) {
      console.error('Error joining circle:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveCircle = async (e, circleId) => {
    e.preventDefault();
    try {
      setJoiningId(circleId);
      const res = await api.delete(`/circles/${circleId}/leave`);
      if (res.data.success) {
        await refreshUser();
        fetchCircles();
      }
    } catch (err) {
      console.error('Error leaving circle:', err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Novelty 1: Community Help Circles</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Community Help Circles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Focused sub-communities that prevent unorganized request spam. Join relevant circles to discover requests tailored to your department, hostel, or interests.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            setIsCreateModalOpen(true);
          }}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create Help Circle
        </button>
      </div>

      {/* Grid of Circles */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading Help Circles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <div
              key={circle._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {circle.category || 'General'}
                  </span>
                </div>

                <Link to={`/circles/${circle._id}`}>
                  <h3 className="font-display text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {circle.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {circle.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {circle.membersCount} Members
                  </span>
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    {circle.activeRequestsCount} Active Requests
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/circles/${circle._id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
                  >
                    View Requests →
                  </Link>

                  {circle.isMember ? (
                    <button
                      disabled={joiningId === circle._id}
                      onClick={(e) => handleLeaveCircle(e, circle._id)}
                      className="py-2 px-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Joined
                    </button>
                  ) : (
                    <button
                      disabled={joiningId === circle._id}
                      onClick={(e) => handleJoinCircle(e, circle._id)}
                      className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {joiningId === circle._id ? 'Joining...' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchCircles()}
      />
    </div>
  );
}
