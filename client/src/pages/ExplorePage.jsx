import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Users,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';

export default function ExplorePage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'relevant'
  const [requests, setRequests] = useState([]);
  const [relevantRequests, setRelevantRequests] = useState([]);
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [circleId, setCircleId] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [availableSlotsOnly, setAvailableSlotsOnly] = useState(false);

  // Check URL search params (e.g. ?circle=xxx)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const circleParam = params.get('circle');
    if (circleParam) {
      setCircleId(circleParam);
    }
  }, [location.search]);

  // Fetch Circles for filter dropdown
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const res = await api.get('/circles');
        if (res.data.success) {
          setCircles(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching circles:', err);
      }
    };
    fetchCircles();
  }, []);

  // Fetch All Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (circleId !== 'All') params.append('circleId', circleId);
      if (urgency !== 'All') params.append('urgency', urgency);
      if (sortBy) params.append('sortBy', sortBy);
      if (availableSlotsOnly) params.append('availableSlotsOnly', 'true');

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rule-Based Relevant Requests (NO AI!)
  const fetchRelevant = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/requests/relevant');
      if (res.data.success) {
        setRelevantRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching relevant requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchRequests();
    } else {
      fetchRelevant();
    }
  }, [activeTab, search, category, circleId, urgency, sortBy, availableSlotsOnly, isAuthenticated]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCircleId('All');
    setUrgency('All');
    setSortBy('newest');
    setAvailableSlotsOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-600" />
            Explore Community Help Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover peer assistance needs across focused Help Circles and global community channels.
          </p>
        </div>

        {/* Tab Switcher: All Requests vs Rule-Based Relevant */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('relevant')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'relevant'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Relevant For You (Rule-Based)</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Facet Filters Bar */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests by title, description, skills, or location..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Facet Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Events">Events</option>
                <option value="Transportation">Transportation</option>
                <option value="Household">Household</option>
                <option value="Moving">Moving</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Help Circle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Help Circle
              </label>
              <select
                value={circleId}
                onChange={(e) => setCircleId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Help Circles</option>
                <option value="global">Global (No Circle)</option>
                {circles.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Urgencies</option>
                <option value="High">High Urgency</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="urgent">Most Urgent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Available slots toggle & Reset */}
            <div className="col-span-2 sm:col-span-1 flex items-end justify-between sm:justify-start gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 py-2">
                <input
                  type="checkbox"
                  checked={availableSlotsOnly}
                  onChange={(e) => setAvailableSlotsOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Open Slots Only</span>
              </label>

              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relevant Tab Explanation Box */}
      {activeTab === 'relevant' && (
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 fill-amber-500 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Transparent Rule-Based Request Discovery (Zero AI)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Requests below are prioritized exclusively through deterministic community rules:
                <strong> Same Help Circle membership</strong>, <strong>matching registered skills</strong>, <strong>department proximity</strong>, and <strong>location</strong>.
                Each card displays the exact explicit reason why it is recommended to you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading community requests...</p>
        </div>
      ) : activeTab === 'all' ? (
        requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700">No requests match your filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or clear search.</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )
      ) : (
        // Relevant Tab
        relevantRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700">No rule-matched requests found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Join more Help Circles or add skills in your profile to unlock explainable matches!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantRequests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                relevanceReasons={req.relevanceReasons}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
