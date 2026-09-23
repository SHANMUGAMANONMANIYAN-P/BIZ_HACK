import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  HeartHandshake,
  CheckCircle2,
  Users,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'offers'
  const [myRequests, setMyRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all requests and find user's requests and offers
        const res = await api.get('/requests');
        if (res.data.success) {
          const all = res.data.data;
          const owned = all.filter(
            (r) => r.requesterId?._id === user._id || r.requesterId === user._id
          );
          setMyRequests(owned);
        }

        // Fetch user passport for completed offers count
        const passportRes = await api.get('/auth/passport');
        if (passportRes.data.success) {
          // Passport has recent contributions
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-indigo-600" />
            My Assistance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <strong>{user?.name}</strong> • {user?.department || 'General Member'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Award className="w-4 h-4 text-amber-600" />
            Contribution Passport
          </Link>

          <Link
            to="/requests/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Request
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">My Requests</span>
            <PlusCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{myRequests.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {myRequests.filter((r) => r.status === 'OPEN').length} active / open
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Help Circles</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-600">
            {user?.circleIds?.length || 0}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">joined communities</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Department</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 truncate block">
            {user?.department || 'General'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{user?.location}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Passport Status</span>
            <Award className="w-4 h-4 text-teal-500" />
          </div>
          <span className="text-sm font-bold text-teal-700 block">Verified Member</span>
          <Link to="/profile" className="text-[11px] text-indigo-600 font-semibold hover:underline block mt-1">
            View full passport →
          </Link>
        </div>
      </div>

      {/* Main Table: My Requests */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              My Help Requests ({myRequests.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your created requests, accept helper offers, and confirm completed tasks.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading your requests...</p>
          </div>
        ) : myRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">You haven't posted any help requests yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
              Need assistance with an assignment, event setup, or campus task?
            </p>
            <Link
              to="/requests/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              Post a Request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Help Circle</th>
                  <th className="py-3 px-4">Helper Slots</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link to={`/requests/${req._id}`} className="hover:text-indigo-600 block">
                        {req.title}
                      </Link>
                      <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                        {req.category} • {req.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {req.circleId?.name || (
                        <span className="text-slate-400 italic">Global</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-700">
                        {req.confirmedHelpersCount || 0} / {req.helpersRequired || 1}
                      </span>
                      <span className="text-[10px] text-slate-400 block">confirmed</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span>{req.requiredDate}</span>
                      <span className="text-[10px] text-slate-400 block">{req.requiredTime}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/requests/${req._id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
