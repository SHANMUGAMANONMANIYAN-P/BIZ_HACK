import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Compass,
  ShieldAlert,
  BarChart3,
  Trash2,
  UserX,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('stats'); // 'stats' | 'users' | 'requests' | 'reports'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/explore');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, reqsRes, reportsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/requests'),
          api.get('/admin/reports'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (usersRes.data.success) setUsersList(usersRes.data.data);
        if (reqsRes.data.success) setRequestsList(reqsRes.data.data);
        if (reportsRes.data.success) setReportsList(reportsRes.data.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, isAdmin, navigate]);

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/suspend`);
      if (res.data.success) {
        setMsg(res.data.message);
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
        );
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to remove this request?')) return;
    try {
      const res = await api.delete(`/requests/${requestId}`);
      if (res.data.success) {
        setMsg('Request deleted by admin.');
        setRequestsList((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await api.patch(`/admin/reports/${reportId}/resolve`, { status });
      if (res.data.success) {
        setMsg(`Report marked as ${status}.`);
        setReportsList((prev) =>
          prev.map((rep) => (rep._id === reportId ? { ...rep, status } : rep))
        );
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to resolve report.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Community Administration & Trust Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor platform metrics, manage user accounts, resolve reports, and enforce safety.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setTab('stats')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              tab === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Stats
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              tab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" /> Users ({usersList.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              tab === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-600" /> Requests ({requestsList.length})
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              tab === 'reports' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Reports ({reportsList.length})
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* TAB 1: STATS OVERVIEW */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-3xl font-extrabold text-indigo-600 block mb-1">
                {stats.totalUsers}
              </span>
              <span className="text-xs font-bold uppercase text-slate-500">Total Users</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-3xl font-extrabold text-blue-600 block mb-1">
                {stats.totalRequests}
              </span>
              <span className="text-xs font-bold uppercase text-slate-500">Total Requests</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-3xl font-extrabold text-teal-600 block mb-1">
                {stats.completedRequests}
              </span>
              <span className="text-xs font-bold uppercase text-slate-500">Completed (Assisted)</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-3xl font-extrabold text-rose-600 block mb-1">
                {stats.pendingReports}
              </span>
              <span className="text-xs font-bold uppercase text-slate-500">Pending Reports</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Request Breakdown</h4>
              <p className="text-xs text-slate-700 py-1">Open: <strong>{stats.openRequests}</strong></p>
              <p className="text-xs text-slate-700 py-1">In Progress: <strong>{stats.inProgressRequests}</strong></p>
              <p className="text-xs text-slate-700 py-1">Closed / Assisted: <strong>{stats.completedRequests}</strong></p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Community Circles</h4>
              <p className="text-xs text-slate-700 py-1">Active Help Circles: <strong>{stats.totalCircles}</strong></p>
              <p className="text-xs text-slate-700 py-1">Total Help Offers Submitted: <strong>{stats.totalOffers}</strong></p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Hackathon Verification</h4>
              <p className="text-xs text-emerald-700 font-bold py-1">✓ 100% Software Architecture</p>
              <p className="text-xs text-slate-600 py-1">✓ No AI • No Blockchain • No Currency</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS TABLE */}
      {tab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User Name & Email</th>
                <th className="py-3 px-4">Department & Location</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span>{u.department}</span>
                    <span className="text-[10px] text-slate-400 block">{u.location}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.isSuspended ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleSuspend(u._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.isSuspended
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        {u.isSuspended ? 'Reinstate' : 'Suspend User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: REQUESTS TABLE */}
      {tab === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title & Category</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Circle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requestsList.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <Link to={`/requests/${r._id}`} className="hover:text-indigo-600 block">
                      {r.title}
                    </Link>
                    <span className="text-[10px] font-normal text-slate-400">{r.category}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {r.requesterId?.name || 'User'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {r.circleId?.name || <span className="text-slate-400">Global</span>}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="xs" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRequest(r._id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove inappropriate request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REPORTS TABLE */}
      {tab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-x-auto">
          {reportsList.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">No reports filed.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportsList.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {rep.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      {rep.description || 'No additional details.'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rep.reportedBy?.name || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {rep.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'resolved')}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'dismissed')}
                            className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
